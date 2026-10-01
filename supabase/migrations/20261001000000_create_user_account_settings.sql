create table if not exists public.user_account_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  starting_balance numeric(18, 2) not null default 10000 check (starting_balance > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_account_settings_user_idx on public.user_account_settings(user_id);
alter table public.user_account_settings enable row level security;
drop policy if exists "Users can view their own account settings" on public.user_account_settings;
create policy "Users can view their own account settings" on public.user_account_settings for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own account settings" on public.user_account_settings;
create policy "Users can create their own account settings" on public.user_account_settings for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own account settings" on public.user_account_settings;
create policy "Users can update their own account settings" on public.user_account_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own account settings" on public.user_account_settings;
create policy "Users can delete their own account settings" on public.user_account_settings for delete using (auth.uid() = user_id);

create or replace function public.set_user_account_settings_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists user_account_settings_updated_at on public.user_account_settings;
create trigger user_account_settings_updated_at before update on public.user_account_settings for each row execute function public.set_user_account_settings_updated_at();
