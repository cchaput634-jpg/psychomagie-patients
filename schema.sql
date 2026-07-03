-- Schéma de la base de données du Cabinet de Psychomagie
-- D1 (SQLite). Appliquer avec :
--   npx wrangler d1 execute psychomagie-patients-db --local  --file=./schema.sql
--   npx wrangler d1 execute psychomagie-patients-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS profiles (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patients (
  id           TEXT PRIMARY KEY,
  profile_id   TEXT NOT NULL,
  name         TEXT NOT NULL,
  last_seen    TEXT NOT NULL DEFAULT '',   -- format JJ/MM/AA
  notes        TEXT NOT NULL DEFAULT '',
  priority     INTEGER NOT NULL DEFAULT 0, -- 0/1
  rdv_proposed INTEGER NOT NULL DEFAULT 0, -- 0/1
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_patients_profile ON patients(profile_id);

-- Comptes rendus de réunion (indépendants des profils)
CREATE TABLE IF NOT EXISTS meetings (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  meeting_date TEXT NOT NULL DEFAULT '',   -- format JJ/MM/AA
  attendees    TEXT NOT NULL DEFAULT '',   -- personnes présentes
  theme        TEXT NOT NULL DEFAULT '',   -- thème général
  infos        TEXT NOT NULL DEFAULT '',   -- infos transmises
  ideas        TEXT NOT NULL DEFAULT '',   -- idées échangées
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
