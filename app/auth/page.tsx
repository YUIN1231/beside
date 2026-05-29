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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border-2)',
    borderRadius: 0,
    padding: '12px 0',
    fontSize: '18px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font-inter)',
  }

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>

      <div style={{ padding: '3.5rem 2rem 0' }}>
        <span style={{
          fontSize: '10px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
          fontFamily: 'var(--font-space)',
        }}>beside</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 2rem 5rem' }}>

        <div className="fade-up" style={{ marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 12vw, 4rem)',
            lineHeight: 1.05,
            fontStyle: 'italic',
            fontWeight: 400,
            marginBottom: '1rem',
          }}>
            Who<br />are you?
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>
            People who were beside you<br />will find you by name.
          </p>
        </div>

        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '4px' }}>Name</p>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="your name"
              autoComplete="name"
              style={inputStyle}
            />
          </div>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '4px' }}>Email</p>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="your@email.com"
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#C4422A' }}>{error}</p>
          )}
        </div>

        <div className="fade-up-3">
          <button
            onClick={submit}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--gold)',
              fontSize: '1.125rem',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Setting up…' : 'Begin →'}
          </button>
          <p style={{ marginTop: '1.5rem', fontSize: '10px', color: 'var(--text-3)', lineHeight: 1.6 }}>
            Used only to identify you to people<br />you were physically beside.
          </p>
        </div>
      </div>
    </main>
  )
}
