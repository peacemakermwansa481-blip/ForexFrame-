-- ForexFrame Backtesting Phase 1
-- This schema is intentionally separate from the journal `trades` table.

create table if not exists public.backtests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  instrument text not null,
  timeframe text not null,
  start_date date not null,
  end_date date not null,
  strategy_name text not null,
  strategy_description text,
  direction text not null default 'Both' check (direction in ('Buy', 'Sell', 'Both')),
  starting_balance numeric(18, 2) not null check (starting_balance > 0),
  risk_per_trade numeric(8, 4) not null default 1 check (risk_per_trade > 0 and risk_per_trade <= 100),
  max_simultaneous_positions integer not null default 1 check (max_simultaneous_positions > 0),
  commission_per_trade numeric(18, 6) not null default 0 check (commission_per_trade >= 0),
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed', 'archived')),
  replay_index integer not null default -1 check (replay_index >= -1),
  replay_balance numeric(18, 2),
  replay_position jsonb,
  replay_status text not null default 'idle' check (replay_status in ('idle', 'running', 'paused', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint backtests_valid_date_range check (end_date >= start_date)
);

create table if not exists public.backtest_trades (
  id uuid primary key default gen_random_uuid(),
  backtest_id uuid not null references public.backtests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_date timestamptz not null,
  instrument text not null,
  direction text not null check (direction in ('Buy', 'Sell')),
  entry numeric(18, 8) not null,
  exit_price numeric(18, 8),
  stop_loss numeric(18, 8),
  take_profit numeric(18, 8),
  position_size numeric(18, 8),
  risk_percent numeric(8, 4),
  simulated_pnl numeric(18, 2) not null default 0,
  r_multiple numeric(12, 4),
  outcome text not null check (outcome in ('Win', 'Loss', 'Breakeven')),
  strategy text,
  entry_reason text,
  exit_reason text,
  emotion text,
  mistake text,
  lesson text,
  created_at timestamptz not null default now()
);

create index if not exists backtests_user_created_idx on public.backtests(user_id, created_at desc);
create index if not exists backtest_trades_session_date_idx on public.backtest_trades(backtest_id, trade_date asc);

alter table public.backtests enable row level security;
alter table public.backtest_trades enable row level security;

drop policy if exists "Users can view their own backtests" on public.backtests;
create policy "Users can view their own backtests" on public.backtests for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own backtests" on public.backtests;
create policy "Users can create their own backtests" on public.backtests for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own backtests" on public.backtests;
create policy "Users can update their own backtests" on public.backtests for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own backtests" on public.backtests;
create policy "Users can delete their own backtests" on public.backtests for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their own backtest trades" on public.backtest_trades;
create policy "Users can view their own backtest trades" on public.backtest_trades for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own backtest trades" on public.backtest_trades;
create policy "Users can create their own backtest trades" on public.backtest_trades for insert with check (auth.uid() = user_id and exists (select 1 from public.backtests where id = backtest_id and user_id = auth.uid()));
drop policy if exists "Users can update their own backtest trades" on public.backtest_trades;
create policy "Users can update their own backtest trades" on public.backtest_trades for update using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.backtests where id = backtest_id and user_id = auth.uid()));
drop policy if exists "Users can delete their own backtest trades" on public.backtest_trades;
create policy "Users can delete their own backtest trades" on public.backtest_trades for delete using (auth.uid() = user_id);

create or replace function public.set_backtest_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists backtests_updated_at on public.backtests;
create trigger backtests_updated_at before update on public.backtests for each row execute function public.set_backtest_updated_at();
