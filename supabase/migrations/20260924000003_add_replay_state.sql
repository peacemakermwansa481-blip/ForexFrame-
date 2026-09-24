alter table if exists public.backtests add column if not exists replay_index integer not null default -1;
alter table if exists public.backtests add column if not exists replay_balance numeric(18, 2);
alter table if exists public.backtests add column if not exists replay_position jsonb;
alter table if exists public.backtests add column if not exists replay_status text not null default 'idle';
