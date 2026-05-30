'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getJoinSession, submitJoinEntry } from '../../lib/supabase'
import { saveUser, markOnboarded, getUser } from '../../lib/storage'

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-space)',
  fontSize: '9px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-3)',
}

export default function Join() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [session, setSession] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (user) { setName(user.name); setEmail(user.email) }
    getJoinSession(id).then(data => {
      if (!data) setNotFound(true)
      else setSession(data)
    })
  }, [id])

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const submit = async () => {
    const n = name.trim()
    const e = email.trim().toLowerCase()
    if (!n) { setError('Name is required.'); return }
    if (!isValidEmail(e)) { setError('Enter a valid email.'); return }
    setLoading(true)
    const ok = await submitJoinEntry(id, n, e)
    if (!ok) { setError('Something went wrong. Try again.'); setLoading(false); return }
    saveUser({ id: e, name: n, email: e })
    markOnboarded()
    setDone(true)
    setLoading(false)
  }

  const lineStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border-2)',
    padding: '14px 0',
    fontSize: '18px',
    color: 'var(--text)',
    fontFamily: 'var(--font-inter)',
    outline: 'none',
  }

  if (notFound) return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
      <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)', fontWeight: 300 }}>
        This session has expired or doesn't exist.
      </p>
      <a href="/" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.125rem', marginTop: '1.5rem', textDecoration: 'none' }}>Go home →</a>
    </main>
  )

  if (!session) return (
    <main style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', animation: 'gold-glow 2s ease infinite' }} />
    </main>
  )

  if (done) return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: '0', background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="stamp" style={{
        width: '96px', height: '96px', borderRadius: '50%',
        background: 'var(--gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '2.5rem',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '44px', color: 'var(--bg)', fontWeight: 700, fontStyle: 'italic' }}>B</span>
      </div>
      <h2 className="fade-up" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.4rem, 10vw, 3.2rem)',
        fontStyle: 'italic',
        fontWeight: 400,
        lineHeight: 1.08,
        marginBottom: '1rem',
      }}>You're in.</h2>
      <p className="fade-up-2" style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'var(--font-space)', fontWeight: 300, lineHeight: 1.65, marginBottom: '0.5rem' }}>
        You've been added to {session.host_name}'s capsule.
      </p>
      <p className="fade-up-2" style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--font-space)', marginBottom: '3rem' }}>
        {session.city} · Opens in 1 month
      </p>
      <a href="/" className="fade-up-3" style={{
        color: 'var(--gold)', fontSize: '1.125rem',
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        textDecoration: 'none',
      }}>
        Take your own capsule →
      </a>
    </main>
  )

  return (
    <main style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>

      <div style={{ padding: '3.5rem 2rem 0', display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-space)', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--text-3)' }}>beside</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 2rem 5rem', gap: '3rem' }}>

        <div className="fade-up">
          <p style={{ ...LABEL, color: 'var(--gold-dim)', marginBottom: '1.25rem' }}>
            {session.city ?? 'Join capsule'}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 9vw, 3rem)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.08,
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            {session.host_name} wants to<br />capture this moment.
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'var(--font-space)', fontWeight: 300, lineHeight: 1.65 }}>
            Enter your details to be sealed inside together.
          </p>
        </div>

        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <p style={{ ...LABEL, marginBottom: '6px' }}>Name</p>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setError('') }}
              placeholder="your name" autoComplete="name" style={lineStyle} />
          </div>
          <div>
            <p style={{ ...LABEL, marginBottom: '6px' }}>Email</p>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="your@email.com" autoComplete="email" style={lineStyle} />
          </div>
          {error && <p style={{ fontSize: '12px', color: 'var(--gold)', fontFamily: 'var(--font-space)' }}>{error}</p>}
        </div>

        <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <button onClick={submit} disabled={loading} style={{
            background: 'var(--gold)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: '50px',
            padding: '16px',
            fontSize: '14px',
            fontFamily: 'var(--font-space)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            opacity: loading ? 0.5 : 1,
            width: '100%',
          }}>
            {loading ? 'Joining…' : 'Join capsule'}
          </button>
          <p style={{ ...LABEL, textAlign: 'center', lineHeight: 1.65 }}>
            You'll be able to see this capsule when it opens in 1 month.
          </p>
        </div>
      </div>
    </main>
  )
}
