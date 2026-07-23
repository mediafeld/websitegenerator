-- ============================================================
-- websitegenerator24 – Datenbank einrichten
-- Einmalig ausführen: Supabase -> SQL Editor -> einfügen -> Run
-- ============================================================

-- ------------------------------------------------------------
-- 1) Projekte (die Websites deiner Kunden)
-- ------------------------------------------------------------
create table if not exists public.projekte (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Neue Website',
  firma       text,
  branche     text,
  status      text not null default 'entwurf',   -- entwurf | fertig | online
  domain      text,
  form_data   jsonb,
  pages       jsonb,
  palette     jsonb,
  font        text,
  erstellt_am timestamptz not null default now(),
  geaendert_am timestamptz not null default now()
);

-- Schneller Zugriff auf die Projekte eines Nutzers
create index if not exists projekte_user_idx on public.projekte (user_id, geaendert_am desc);

-- ------------------------------------------------------------
-- 2) Zeilenschutz (Row Level Security)
--    Jeder sieht und ändert AUSSCHLIESSLICH seine eigenen Projekte.
-- ------------------------------------------------------------
alter table public.projekte enable row level security;

drop policy if exists "eigene projekte lesen"    on public.projekte;
drop policy if exists "eigene projekte anlegen"  on public.projekte;
drop policy if exists "eigene projekte aendern"  on public.projekte;
drop policy if exists "eigene projekte loeschen" on public.projekte;

create policy "eigene projekte lesen"
  on public.projekte for select
  using (auth.uid() = user_id);

create policy "eigene projekte anlegen"
  on public.projekte for insert
  with check (auth.uid() = user_id);

create policy "eigene projekte aendern"
  on public.projekte for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "eigene projekte loeschen"
  on public.projekte for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3) "geaendert_am" automatisch aktualisieren
-- ------------------------------------------------------------
create or replace function public.set_geaendert_am()
returns trigger
language plpgsql
as $$
begin
  new.geaendert_am = now();
  return new;
end;
$$;

drop trigger if exists projekte_geaendert on public.projekte;
create trigger projekte_geaendert
  before update on public.projekte
  for each row execute function public.set_geaendert_am();

-- ------------------------------------------------------------
-- Fertig. Prüfen mit:  select * from public.projekte;
-- ------------------------------------------------------------
