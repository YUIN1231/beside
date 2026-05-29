-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- Profiles (email-based identity, no auth)
CREATE TABLE IF NOT EXISTS profiles (
  email      TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capsules
CREATE TABLE IF NOT EXISTS capsules (
  id           TEXT PRIMARY KEY,
  owner_email  TEXT NOT NULL REFERENCES profiles(email),
  location     TEXT,
  city         TEXT,
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  created_at   TIMESTAMPTZ NOT NULL,
  sealed_at    TIMESTAMPTZ,
  opens_at     TIMESTAMPTZ,
  opened       BOOLEAN DEFAULT FALSE,
  audio_url    TEXT,
  photo_url    TEXT,
  video_url    TEXT
);

-- Capsule members
CREATE TABLE IF NOT EXISTS capsule_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id   TEXT NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT,
  initial      TEXT,
  confirmed_at TIMESTAMPTZ
);

-- Join sessions (QR code waiting room)
CREATE TABLE IF NOT EXISTS join_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id   TEXT NOT NULL,
  host_email   TEXT NOT NULL,
  host_name    TEXT NOT NULL,
  city         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 hours'
);

-- Join entries (people who scan the QR)
CREATE TABLE IF NOT EXISTS join_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES join_sessions(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: enable but allow all for MVP
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_entries   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow all" ON profiles        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON capsules        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON capsule_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON join_sessions   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow all" ON join_entries    FOR ALL USING (true) WITH CHECK (true);

-- Realtime for join_entries (so Person A sees Person B joining in real-time)
ALTER PUBLICATION supabase_realtime ADD TABLE join_entries;
