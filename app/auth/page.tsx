'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, saveUser, markOnboarded } from '../lib/storage'
import { upsertProfile } from '../lib/supabase'

export default function Auth() {
  const router = useRouter()
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) router.replace('/')
  }, [router])

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const submit = () => {
    const n = name.trim()
    const e = email.trim().toLowerCase()
    if (!n) { setError('Name is required.'); return }
    if (!isValidEmail(e)) { setError('Enter a valid email.'); return }
    setLoading(true)
    const user = { id: e, name: n, email: e }
    saveUser(user)
    markOnboarded()
    upsertProfile(user).catch(() => {})
    router.replace('/')
  }

  const lineStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border-2)',
    borderRadius: 0,
    padding: '14px 0',
    fontSize: '18px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font-inter)',
  }

  return (
    <main style={{
      minHeight: '100svh',
      background: 'var(--bg)',
      color: 'var(--text)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '3.5rem 2rem 0' }}>
        <span style={{
          fontFamily: 'var(--font-space)',
          fontSize: '10px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}>beside</span>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 2rem 5rem',
      }}>
        <div className="fade-up" style={{ marginBottom: '3.5rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 13vw, 4.5rem)',
            lineHeight: 1.04,
            fontStyle: 'italic',
            fontWeight: 400,
            marginBottom: '1.25rem',
            letterSpacing: '-0.01em',
          }}>
            Who<br />are you?
          </h1>
          <p style={{
            color: 'var(--text-2)',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            fontFamily: 'var(--font-space)',
            fontWeight: 300,
          }}>
            People who were beside you<br />will find you by name.
          </p>
        </div>

        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem', marginBottom: '3rem' }}>
          <div>
            <p style={{ fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-space)' }}>Name</p>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="your name"
              autoComplete="name"
              style={lineStyle}
            />
          </div>
          <div>
            <p style={{ fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'var(--font-space)' }}>Email</p>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="your@email.com"
              autoComplete="email"
              style={lineStyle}
            />
          </div>
          {error && (
            <p style={{ fontSize: '12px', color: 'var(--gold)', fontFamily: 'var(--font-space)' }}>{error}</p>
          )}
        </div>

        <div className="fade-up-3">
          <button onClick={submit} disabled={loading} style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--gold)',
            fontSize: '1.25rem',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            opacity: loading ? 0.45 : 1,
          }}>
            {loading ? 'Setting up…' : 'Begin →'}
          </button>
          <p style={{ marginTop: '1.75rem', fontSize: '10px', color: 'var(--text-3)', lineHeight: 1.65, fontFamily: 'var(--font-space)' }}>
            Used only to identify you to people<br />you were physically beside.
          </p>
        </div>
      </div>
    </main>
  )
}
