-- ═══════════════════════════════════════════════════════════════════════════
-- REPARATUR-MIGRATION (v38)
-- Behebt: „Meine Daten" speichert nicht  ·  „Rechnungsdaten für diese Website"
-- speichert nicht  ·  Warnung „Straße, PLZ, Ort fehlen" verschwindet nicht.
--
-- Ursache: In der Tabelle `profile` fehlten Spalten und/oder die Schreibrechte
-- (Row Level Security), außerdem fehlten die Rechnungsdaten-Spalten an
-- `projekte`. Dieses Skript legt alles fehlende an – vorhandene Daten bleiben
-- unangetastet. Mehrfaches Ausführen ist gefahrlos.
--
-- Supabase-Dashboard → SQL Editor → New query → alles einfügen → RUN.
-- Ganz unten erscheint eine Prüftabelle: dort muss überall „ja" stehen.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1) Profil-Tabelle sicherstellen ───────────────────────────────────────
create table if not exists public.profile (
  id uuid primary key references auth.users(id) on delete cascade
);

-- Alle Felder des Formulars „Meine Daten"
alter table public.profile add column if not exists anrede        text;
alter table public.profile add column if not exists vorname       text;
alter table public.profile add column if not exists nachname      text;
alter table public.profile add column if not exists firma         text;
alter table public.profile add column if not exists rechtsform    text;
alter table public.profile add column if not exists strasse       text;
alter table public.profile add column if not exists zusatz        text;
alter table public.profile add column if not exists plz           text;
alter table public.profile add column if not exists ort           text;
alter table public.profile add column if not exists land          text default 'Deutschland';
alter table public.profile add column if not exists telefon       text;
alter table public.profile add column if not exists ust_id        text;
alter table public.profile add column if not exists steuernummer  text;
alter table public.profile add column if not exists rechnung_mail text;
-- Aus früheren Erweiterungen (schaden nicht, falls schon vorhanden)
alter table public.profile add column if not exists handelsregister    text;
alter table public.profile add column if not exists stripe_customer_id text;
alter table public.profile add column if not exists erstellt_am  timestamptz not null default now();
alter table public.profile add column if not exists geaendert_am timestamptz not null default now();

-- Kundennummern (falls migration_admin_v2 noch nicht gelaufen ist)
create sequence if not exists kundennummer_seq start 1000;
alter table public.profile add column if not exists kundennummer integer;
create unique index if not exists profile_kundennummer_einmalig on public.profile (kundennummer);

with reihenfolge as (
  select p.id from public.profile p
  left join auth.users u on u.id = p.id
  where p.kundennummer is null
  order by u.created_at nulls last, p.id
)
update public.profile p set kundennummer = nextval('kundennummer_seq')
from reihenfolge r where p.id = r.id;

alter table public.profile alter column kundennummer set default nextval('kundennummer_seq');

-- ── 2) Schreibrechte für das eigene Profil (das fehlte!) ──────────────────
alter table public.profile enable row level security;

drop policy if exists "eigenes profil lesen"   on public.profile;
drop policy if exists "eigenes profil anlegen" on public.profile;
drop policy if exists "eigenes profil aendern" on public.profile;

create policy "eigenes profil lesen"
  on public.profile for select using (auth.uid() = id);

create policy "eigenes profil anlegen"
  on public.profile for insert with check (auth.uid() = id);

create policy "eigenes profil aendern"
  on public.profile for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── 3) Rechnungsdaten je Website (Dashboard-Formular) ─────────────────────
alter table public.projekte add column if not exists re_firma           text;
alter table public.projekte add column if not exists re_vorname         text;
alter table public.projekte add column if not exists re_nachname        text;
alter table public.projekte add column if not exists re_strasse         text;
alter table public.projekte add column if not exists re_plz             text;
alter table public.projekte add column if not exists re_ort             text;
alter table public.projekte add column if not exists re_ust_id          text;
alter table public.projekte add column if not exists re_handelsregister text;
alter table public.projekte add column if not exists erinnert_am        timestamptz;

-- ── 4) Restliche Tabellen aus v26/v27 (nur anlegen, falls sie fehlen) ─────
create table if not exists public.nutzung (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, projekt_id uuid, art text, menge integer default 1,
  erstellt_am timestamptz not null default now()
);
alter table public.nutzung enable row level security;

create table if not exists public.admin_protokoll (
  id uuid primary key default gen_random_uuid(),
  aktion text, detail text,
  erstellt_am timestamptz not null default now()
);
alter table public.admin_protokoll enable row level security;

create table if not exists public.admin_notizen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  erstellt_am timestamptz not null default now()
);
alter table public.admin_notizen enable row level security;

create table if not exists public.mail_vorlagen (
  schluessel text primary key, betreff text, inhalt text,
  geaendert_am timestamptz not null default now()
);
alter table public.mail_vorlagen enable row level security;

create table if not exists public.projekt_versionen (
  id uuid primary key default gen_random_uuid(),
  projekt_id uuid not null references public.projekte(id) on delete cascade,
  user_id uuid, pages jsonb, palette jsonb, font text, form_data jsonb,
  anlass text default 'speichern',
  erstellt_am timestamptz not null default now()
);
create index if not exists projekt_versionen_projekt_idx
  on public.projekt_versionen (projekt_id, erstellt_am desc);
alter table public.projekt_versionen enable row level security;

drop policy if exists "versionen_select" on public.projekt_versionen;
drop policy if exists "versionen_insert" on public.projekt_versionen;
drop policy if exists "versionen_delete" on public.projekt_versionen;
create policy "versionen_select" on public.projekt_versionen for select using (auth.uid() = user_id);
create policy "versionen_insert" on public.projekt_versionen for insert with check (auth.uid() = user_id);
create policy "versionen_delete" on public.projekt_versionen for delete using (auth.uid() = user_id);

-- Rechnungen (nur falls die Tabelle schon existiert)
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='rechnungen') then
    execute 'alter table public.rechnungen add column if not exists erstellt_am timestamptz not null default now()';
  end if;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PRÜFUNG — hier muss ÜBERALL „ja" stehen
-- ═══════════════════════════════════════════════════════════════════════════
select
  (select case when count(*) = 14 then 'ja' else 'NEIN (' || count(*) || '/14)' end
     from information_schema.columns
    where table_schema='public' and table_name='profile'
      and column_name in ('anrede','vorname','nachname','firma','rechtsform','strasse',
                          'zusatz','plz','ort','land','telefon','ust_id','steuernummer','rechnung_mail')
  ) as profil_felder,
  (select case when count(*) >= 3 then 'ja' else 'NEIN (' || count(*) || '/3)' end
     from pg_policies where schemaname='public' and tablename='profile'
  ) as profil_schreibrechte,
  (select case when count(*) = 8 then 'ja' else 'NEIN (' || count(*) || '/8)' end
     from information_schema.columns
    where table_schema='public' and table_name='projekte'
      and column_name like 're\_%'
  ) as rechnungsdaten_je_website,
  (select case when count(*) = 5 then 'ja' else 'NEIN (' || count(*) || '/5)' end
     from information_schema.tables
    where table_schema='public'
      and table_name in ('nutzung','admin_protokoll','admin_notizen','mail_vorlagen','projekt_versionen')
  ) as zusatz_tabellen,
  (select count(*) from public.profile where kundennummer is not null) as kunden_mit_nummer;
