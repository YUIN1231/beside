import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = url && key ? createClient(url, key) : null

/*
── Supabase schema (run in SQL editor) ──────────────────────────────

CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE capsules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  location   TEXT,
  city       TEXT,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sealed_at  TIMESTAMPTZ,
  opens_at   TIMESTAMPTZ
);

CREATE TABLE capsule_members (
  capsule_id   UUID REFERENCES capsules(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id),
  audio_url    TEXT,
  photo_url    TEXT,
  video_url    TEXT,
  confirmed_at TIMESTAMPTZ,
  PRIMARY KEY (capsule_id, user_id)
);

CREATE TABLE capsule_updates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES capsules(id),
  user_id    UUID REFERENCES users(id),
  audio_url  TEXT,
  photo_url  TEXT,
  video_url  TEXT,
  location   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

────────────────────────────────────────────────────────────────────
*/

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Unknown location'
    )
  } catch {
    return 'Unknown location'
  }
}
