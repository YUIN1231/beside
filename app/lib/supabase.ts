import { createClient } from '@supabase/supabase-js'
import type { Capsule, User } from './types'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL  || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(url, key)

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

export async function upsertProfile(user: User) {
  await supabase.from('profiles').upsert(
    { email: user.email, name: user.name },
    { onConflict: 'email' }
  )
}

export async function uploadMedia(
  capsuleId: string,
  type: 'audio' | 'photo' | 'video',
  blob: Blob
): Promise<string | null> {
  const ext  = type === 'photo' ? 'jpg' : 'webm'
  const path = `${capsuleId}/${type}.${ext}`
  const { error } = await supabase.storage
    .from('capsule-media')
    .upload(path, blob, { upsert: true, contentType: blob.type || undefined })
  if (error) { console.error('upload error', error); return null }
  const { data } = supabase.storage.from('capsule-media').getPublicUrl(path)
  return data.publicUrl
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const binary = atob(b64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export async function saveCapsuleRemote(
  cap: Capsule,
  ownerEmail: string,
  blobs?: { audio?: Blob; photoDataUrl?: string; video?: Blob }
): Promise<Capsule> {
  let audioUrl  = cap.audioUrl
  let photoUrl  = cap.photoUrl
  let videoUrl  = cap.videoUrl

  if (blobs?.audio) {
    const url = await uploadMedia(cap.id, 'audio', blobs.audio)
    if (url) audioUrl = url
  }
  if (blobs?.photoDataUrl) {
    const blob = dataUrlToBlob(blobs.photoDataUrl)
    const url  = await uploadMedia(cap.id, 'photo', blob)
    if (url) photoUrl = url
  }
  if (blobs?.video) {
    const url = await uploadMedia(cap.id, 'video', blobs.video)
    if (url) videoUrl = url
  }

  await supabase.from('capsules').upsert({
    id:          cap.id,
    owner_email: ownerEmail,
    location:    cap.location,
    city:        cap.city,
    latitude:    cap.latitude  ?? null,
    longitude:   cap.longitude ?? null,
    created_at:  cap.createdAt,
    sealed_at:   cap.sealedAt  ?? null,
    opens_at:    cap.opensAt   ?? null,
    opened:      cap.opened    ?? false,
    audio_url:   audioUrl      ?? null,
    photo_url:   photoUrl      ?? null,
    video_url:   videoUrl      ?? null,
  })

  if (cap.members.length > 0) {
    await supabase.from('capsule_members').delete().eq('capsule_id', cap.id)
    await supabase.from('capsule_members').insert(
      cap.members.map(m => ({
        capsule_id:   cap.id,
        name:         m.name,
        email:        m.email        ?? null,
        initial:      m.initial,
        confirmed_at: m.confirmedAt  ?? null,
      }))
    )
  }

  return { ...cap, audioUrl, photoUrl, videoUrl }
}

export async function fetchMyCapsules(email: string): Promise<Capsule[]> {
  const { data, error } = await supabase
    .from('capsules')
    .select('*, capsule_members(*)')
    .eq('owner_email', email)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map((row: any) => ({
    id:        row.id,
    location:  row.location   ?? '',
    city:      row.city        ?? '',
    latitude:  row.latitude    ?? undefined,
    longitude: row.longitude   ?? undefined,
    createdAt: row.created_at,
    sealedAt:  row.sealed_at   ?? undefined,
    opensAt:   row.opens_at    ?? undefined,
    opened:    row.opened      ?? false,
    audioUrl:  row.audio_url   ?? undefined,
    photoUrl:  row.photo_url   ?? undefined,
    videoUrl:  row.video_url   ?? undefined,
    members:   (row.capsule_members ?? []).map((m: any) => ({
      id:          m.id,
      name:        m.name,
      email:       m.email        ?? undefined,
      initial:     m.initial      ?? m.name?.[0]?.toUpperCase() ?? '?',
      confirmedAt: m.confirmed_at ?? undefined,
    })),
  }))
}

export async function markCapsuleOpened(id: string) {
  await supabase.from('capsules').update({ opened: true }).eq('id', id)
}

export async function createJoinSession(
  capsuleId: string,
  hostEmail: string,
  hostName: string,
  city: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('join_sessions')
    .insert({ capsule_id: capsuleId, host_email: hostEmail, host_name: hostName, city })
    .select('id')
    .single()
  if (error) { console.error('createJoinSession', error); return null }
  return data?.id ?? null
}

export async function getJoinSession(sessionId: string) {
  const { data } = await supabase
    .from('join_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  return data
}

export async function getJoinEntries(sessionId: string): Promise<{ name: string; email: string }[]> {
  const { data } = await supabase
    .from('join_entries')
    .select('name, email')
    .eq('session_id', sessionId)
  return data ?? []
}

export async function submitJoinEntry(
  sessionId: string,
  name: string,
  email: string
): Promise<boolean> {
  await supabase.from('profiles').upsert({ email, name }, { onConflict: 'email' })
  const { error } = await supabase
    .from('join_entries')
    .insert({ session_id: sessionId, name, email })
  return !error
}

export function subscribeToSession(
  sessionId: string,
  onEntry: (entry: { name: string; email: string }) => void
) {
  return supabase
    .channel(`join_${sessionId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'join_entries', filter: `session_id=eq.${sessionId}` },
      (payload: any) => onEntry({ name: payload.new.name, email: payload.new.email })
    )
    .subscribe()
}
