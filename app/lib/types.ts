export interface User {
  id?: string
  name: string
  email: string
}

export interface Member {
  id?: string
  name: string
  email?: string
  initial: string
  confirmedAt?: string
}

export interface Capsule {
  id: string
  location: string
  city: string
  latitude?: number
  longitude?: number
  createdAt: string
  sealedAt?: string
  opensAt?: string
  opened?: boolean
  audioUrl?: string
  photoUrl?: string
  videoUrl?: string
  members: Member[]
}

export interface GeoLocation {
  city: string
  latitude: number
  longitude: number
}
