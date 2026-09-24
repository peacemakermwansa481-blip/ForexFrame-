alter table if exists public.backtest_trades add column if not exists exit_price numeric(18, 8);
