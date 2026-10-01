-- Allow authenticated ForexFrame users to use the account and journal tables.
-- Row access remains restricted by the existing RLS policies.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.trading_accounts to authenticated;
grant select, insert, update, delete on table public.trades to authenticated;
notify pgrst, 'reload schema';
