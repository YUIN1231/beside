'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getJoinSession, submitJoinEntry } from '../../lib/supabase'
import { saveUser, markOnboarded, isAuthenticated, getUser } from '../../lib/storage'

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
    // Pre-fill if already logged in
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

    // Register locally
    saveUser({ id: e, name: n, email: e })
    markOnboarded()
    setDone(true)
    setLoading(false)
  }

  if (notFound) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 text-center gap-4"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <p className="text-sm" style={{ color: 'var(--text-2)' }}>This session has expired or doesn't exist.</p>
      <a href="/" className="text-xs" style={{ color: 'var(--gold)' }}>Go home</a>
    </main>
  )

  if (!session) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)', animation: 'gold-glow 2s ease infinite' }} />
    </main>
  )

  if (done) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-8 text-center gap-8"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="stamp w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: 'var(--gold)', boxShadow: '0 0 40px rgba(184,200,240,0.4)' }}>
        <span style={{ fontFamily: 'var(--font-space)', fontSize: '48px', color: 'var(--bg)', fontWeight: 700 }}>B</span>
      </div>
      <div className="fade-up flex flex-col gap-3">
        <h2 className="text-3xl" style={{ fontFamily: 'var(--font-space)' }}>You're in.</h2>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          You've been added to {session.host_name}'s capsule.<br />
          It opens in 1 month.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{session.city}</p>
      </div>
      <a
        href="/"
        className="text-sm tracking-[0.06em] px-10 py-3.5 rounded-full transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #d4e0ff 0%, #b8c8f0 100%)', color: '#06070d', fontWeight: 600 }}
      >
        Take your own capsule
      </a>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* header */}
      <div className="flex items-center justify-center pt-16 pb-0">
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-space)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 pb-16 gap-10">

        <div className="fade-up">
          <p className="text-[11px] tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--gold-dim)' }}>
            {session.city ?? 'Join capsule'}
          </p>
          <h1 className="text-[2rem] leading-snug" style={{ fontFamily: 'var(--font-space)' }}>
            {session.host_name} wants to<br />capture this moment.
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Enter your details to be sealed inside together.
          </p>
        </div>

        <div className="fade-up-2 flex flex-col gap-4">
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--text-3)' }}>Name</p>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Your name"
              autoComplete="name"
              style={{
                width: '100%', background: 'rgba(30,26,20,0.05)',
                border: '1px solid rgba(30,26,20,0.12)', borderRadius: '16px',
                padding: '16px 18px', color: 'var(--text)', fontSize: '16px', outline: 'none',
              }}
            />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--text-3)' }}>Email</p>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="your@email.com"
              autoComplete="email"
              style={{
                width: '100%', background: 'rgba(30,26,20,0.05)',
                border: '1px solid rgba(30,26,20,0.12)', borderRadius: '16px',
                padding: '16px 18px', color: 'var(--text)', fontSize: '16px', outline: 'none',
              }}
            />
          </div>
          {error && <p className="text-xs" style={{ color: '#e87a7a' }}>{error}</p>}
        </div>

        <div className="fade-up-3 flex flex-col gap-4">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 rounded-full text-sm tracking-[0.06em] transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #d4e0ff 0%, #b8c8f0 100%)',
              color: '#06070d', fontWeight: 600,
              boxShadow: '0 4px 24px rgba(184,200,240,0.22)',
            }}
          >
            {loading ? 'Joining…' : 'Join capsule'}
          </button>
          <p className="text-center text-[10px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
            You'll be able to see this capsule when it opens in 1 month.
          </p>
        </div>
      </div>
    </main>
  )
}
