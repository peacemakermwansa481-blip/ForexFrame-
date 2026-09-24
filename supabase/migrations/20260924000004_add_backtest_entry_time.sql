alter table if exists public.backtest_trades add column if not exists entry_time timestamptz;
