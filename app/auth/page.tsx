'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, saveUser, markOnboarded } from '../lib/storage'

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
    saveUser({ id: e, name: n, email: e })
    markOnboarded()
    router.replace('/')
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

      {/* header */}
      <div className="flex items-center justify-center pt-16 pb-0">
        <span className="text-base font-light tracking-[0.4em]" style={{
          fontFamily: 'var(--font-fraunces)',
          background: 'linear-gradient(135deg, var(--gold-bright), var(--gold))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>beside</span>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 pb-16 gap-10">

        <div className="fade-up">
          <p className="text-[11px] tracking-[0.22em] uppercase mb-3" style={{ color: 'var(--gold-dim)' }}>
            Create account
          </p>
          <h1 className="text-[2rem] font-light leading-snug" style={{ fontFamily: 'var(--font-fraunces)' }}>
            Who are you?
          </h1>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Your identity is how people who were beside you will find you again.
          </p>
        </div>

        <div className="fade-up-2 flex flex-col gap-4">
          {/* name */}
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--text-3)' }}>Name</p>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Your name"
              autoComplete="name"
              style={{
                width: '100%',
                background: 'rgba(240,230,208,0.05)',
                border: '1px solid rgba(240,230,208,0.12)',
                borderRadius: '16px',
                padding: '16px 18px',
                color: 'var(--text)',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {/* email */}
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
                width: '100%',
                background: 'rgba(240,230,208,0.05)',
                border: '1px solid rgba(240,230,208,0.12)',
                borderRadius: '16px',
                padding: '16px 18px',
                color: 'var(--text)',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: '#e87a7a' }}>{error}</p>
          )}
        </div>

        <div className="fade-up-3 flex flex-col gap-4">
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 rounded-full text-sm tracking-[0.06em] transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #e8c98a 0%, #c9a96e 100%)',
              color: '#0f0a05',
              fontWeight: 600,
              boxShadow: '0 4px 24px rgba(201,169,110,0.22)',
            }}
          >
            {loading ? 'Setting up…' : 'Get started'}
          </button>

          <p className="text-center text-[10px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
            Your email is used to identify you to people<br />you were physically beside. Nothing else.
          </p>
        </div>
      </div>
    </main>
  )
}
