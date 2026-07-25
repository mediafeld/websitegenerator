-- ============================================================
-- websitegenerator24 – Ergänzung für Stripe (Mieten & Kaufen)
-- Einmalig ausführen, NACHDEM supabase-setup.sql schon läuft:
-- Supabase -> SQL Editor -> einfügen -> Run
-- ============================================================

-- ------------------------------------------------------------
-- 1) Neue Spalten an "projekte" — Zahlungsstatus je Website
-- ------------------------------------------------------------
alter table public.projekte add column if not exists zahlungsart text;              -- 'mieten' | 'kaufen'
alter table public.projekte add column if not exists paket_id text;                 -- z. B. 'plus', 'multipage'
alter table public.projekte add column if not exists stripe_customer_id text;
alter table public.projekte add column if not exists stripe_subscription_id text;

-- ------------------------------------------------------------
-- 2) Rechnungen — automatische Historie aus dem Stripe-Webhook
--    Wird ausschließlich vom Server (Service-Role-Key) befüllt.
-- ------------------------------------------------------------
create table if not exists public.rechnungen (
  id                uuid primary key default gen_random_uuid(),
  stripe_invoice_id text unique not null,
  user_id           uuid references auth.users(id) on delete cascade,
  projekt_id        uuid references public.projekte(id) on delete set null,
  betrag            numeric(10,2) not null,
  waehrung          text not null default 'eur',
  status            text not null default 'bezahlt',
  rechnung_url      text,
  pdf_url           text,
  zeitraum_von      timestamptz,
  zeitraum_bis      timestamptz,
  erstellt_am       timestamptz not null default now()
);

create index if not exists rechnungen_user_idx on public.rechnungen (user_id, erstellt_am desc);

alter table public.rechnungen enable row level security;

drop policy if exists "eigene rechnungen lesen" on public.rechnungen;
create policy "eigene rechnungen lesen"
  on public.rechnungen for select
  using (auth.uid() = user_id);

-- Bewusst KEINE insert/update/delete-Policy für normale Nutzer —
-- nur der Webhook (Service-Role-Key, umgeht RLS) darf Rechnungen anlegen.

-- ------------------------------------------------------------
-- Fertig. Prüfen mit:  select * from public.rechnungen;
-- ------------------------------------------------------------
