create table if not exists public.game_packets (
  id bigint generated always as identity primary key,
  topic text not null,
  packet_id text not null,
  packet jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists game_packets_topic_created_at_idx
  on public.game_packets (topic, created_at);

alter table public.game_packets enable row level security;

drop policy if exists "Public clients can read game packets" on public.game_packets;
create policy "Public clients can read game packets"
  on public.game_packets for select to anon using (true);

drop policy if exists "Public clients can publish game packets" on public.game_packets;
create policy "Public clients can publish game packets"
  on public.game_packets for insert to anon
  with check (
    char_length(topic) between 1 and 100
    and char_length(packet_id) between 1 and 120
    and octet_length(packet::text) <= 24000
  );

create or replace function public.prune_old_game_packets()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.game_packets
  where created_at < now() - interval '2 minutes';
  return new;
end;
$$;

drop trigger if exists prune_old_game_packets_trigger on public.game_packets;
create trigger prune_old_game_packets_trigger
  after insert on public.game_packets
  for each row execute function public.prune_old_game_packets();

grant select, insert on public.game_packets to anon;
grant usage, select on sequence public.game_packets_id_seq to anon;
