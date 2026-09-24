drop policy if exists "Users can create their own backtest trades" on public.backtest_trades;
create policy "Users can create their own backtest trades" on public.backtest_trades for insert with check (auth.uid() = user_id and exists (select 1 from public.backtests where id = backtest_id and user_id = auth.uid()));

drop policy if exists "Users can update their own backtest trades" on public.backtest_trades;
create policy "Users can update their own backtest trades" on public.backtest_trades for update using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.backtests where id = backtest_id and user_id = auth.uid()));
