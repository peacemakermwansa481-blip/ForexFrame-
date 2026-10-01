-- Replace the legacy one-row-per-user balance setting with owner-scoped trading accounts.
-- Existing trades are never deleted. Existing trades are deterministically attached to
-- the user's first migrated Main Account; account_id remains nullable for any legacy
-- rows whose owner cannot be resolved during migration.

create table if not exists public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  starting_balance numeric(18, 2) not null check (starting_balance > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trading_accounts_user_idx on public.trading_accounts(user_id);

alter table public.trading_accounts enable row level security;
drop policy if exists "Users can view their own trading accounts" on public.trading_accounts;
create policy "Users can view their own trading accounts" on public.trading_accounts for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own trading accounts" on public.trading_accounts;
create policy "Users can create their own trading accounts" on public.trading_accounts for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own trading accounts" on public.trading_accounts;
create policy "Users can update their own trading accounts" on public.trading_accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own trading accounts" on public.trading_accounts;
create policy "Users can delete their own trading accounts" on public.trading_accounts for delete using (auth.uid() = user_id);

create or replace function public.set_trading_accounts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists trading_accounts_updated_at on public.trading_accounts;
create trigger trading_accounts_updated_at before update on public.trading_accounts for each row execute function public.set_trading_accounts_updated_at();

alter table public.trades add column if not exists account_id uuid references public.trading_accounts(id) on delete restrict;
create index if not exists trades_account_idx on public.trades(account_id);

create or replace function public.validate_trade_account_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.account_id is not null and not exists (
    select 1 from public.trading_accounts a
    where a.id = new.account_id and a.user_id = new.user_id
  ) then
    raise exception 'Trade account does not belong to the trade owner';
  end if;
  return new;
end;
$$;
drop trigger if exists trades_account_owner_guard on public.trades;
create trigger trades_account_owner_guard
before insert or update of account_id, user_id on public.trades
for each row execute function public.validate_trade_account_owner();

-- Create one deterministic Main Account per existing user. The inspected
-- production project does not contain user_account_settings, so existing users
-- are migrated with the former $10,000 default. If that legacy table exists in
-- another environment, preserve its starting_balance without making this
-- migration depend on the table being present.
do $$
begin
  if to_regclass('public.user_account_settings') is not null then
    execute $sql$
      insert into public.trading_accounts (user_id, name, starting_balance)
      select u.id, 'Main Account', coalesce(s.starting_balance, 10000)
      from auth.users u
      left join public.user_account_settings s on s.user_id = u.id
      where not exists (select 1 from public.trading_accounts a where a.user_id = u.id)
    $sql$;
  else
    insert into public.trading_accounts (user_id, name, starting_balance)
    select u.id, 'Main Account', 10000
    from auth.users u
    where not exists (select 1 from public.trading_accounts a where a.user_id = u.id);
  end if;
end;
$$;

-- Preserve existing history by assigning each user's legacy trades to that user's
-- deterministic Main Account. No trade is deleted or otherwise rewritten.
update public.trades t
set account_id = a.id
from public.trading_accounts a
where t.account_id is null
  and t.user_id = a.user_id
  and a.name = 'Main Account'
  and not exists (
    select 1 from public.trading_accounts newer
    where newer.user_id = a.user_id
      and newer.created_at < a.created_at
  );

-- RLS on trades must continue to enforce ownership through the trade owner and
-- account ownership. Existing policies remain in place; this policy prevents
-- cross-user account references on new or updated trades.
drop policy if exists "Users can insert trades in their own accounts" on public.trades;
create policy "Users can insert trades in their own accounts" on public.trades
for insert with check (auth.uid() = user_id and (account_id is null or exists (select 1 from public.trading_accounts a where a.id = account_id and a.user_id = auth.uid())));
drop policy if exists "Users can update trades in their own accounts" on public.trades;
create policy "Users can update trades in their own accounts" on public.trades
for update using (auth.uid() = user_id) with check (auth.uid() = user_id and (account_id is null or exists (select 1 from public.trading_accounts a where a.id = account_id and a.user_id = auth.uid())));
