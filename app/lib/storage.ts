import type { Capsule, User } from './types'

const KEY = {
  user:      'beside_user',
  capsules:  'beside_capsules',
  onboarded: 'beside_onboarded',
}

function isBrowser() { return typeof window !== 'undefined' }

export function getUser(): User | null {
  if (!isBrowser()) return null
  const raw = localStorage.getItem(KEY.user)
  return raw ? JSON.parse(raw) : null
}

export function saveUser(user: User) {
  localStorage.setItem(KEY.user, JSON.stringify(user))
}

export function getCapsules(): Capsule[] {
  if (!isBrowser()) return []
  const raw = localStorage.getItem(KEY.capsules)
  return raw ? JSON.parse(raw) : []
}

export function saveCapsule(capsule: Capsule) {
  const all = getCapsules()
  const idx = all.findIndex(c => c.id === capsule.id)
  if (idx >= 0) all[idx] = capsule
  else all.unshift(capsule)
  localStorage.setItem(KEY.capsules, JSON.stringify(all))
}

export function isAuthenticated(): boolean {
  if (!isBrowser()) return false
  const user = getUser()
  return !!(user?.email && user?.name)
}

export function isOnboarded(): boolean {
  if (!isBrowser()) return false
  return !!localStorage.getItem(KEY.onboarded)
}

export function markOnboarded() {
  localStorage.setItem(KEY.onboarded, '1')
}

export function signOut() {
  localStorage.removeItem(KEY.user)
  localStorage.removeItem(KEY.capsules)
  localStorage.removeItem(KEY.onboarded)
}

/** Returns the sealed capsule that hasn't opened yet, if any */
export function getActiveSealedCapsule(): Capsule | null {
  return getCapsules().find(
    c => c.sealedAt && c.opensAt && new Date(c.opensAt) > new Date() && !c.opened
  ) ?? null
}

/** Returns the capsule that is now past its open date but not yet viewed */
export function getReadyCapsule(): Capsule | null {
  return getCapsules().find(
    c => c.sealedAt && c.opensAt && new Date(c.opensAt) <= new Date() && !c.opened
  ) ?? null
}

/** Returns true if user has already created a capsule this calendar month */
export function hasCapsuledThisMonth(): boolean {
  const now = new Date()
  return getCapsules().some(c => {
    const d = new Date(c.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
}
