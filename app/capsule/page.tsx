'use client'
import { useState } from 'react'

export default function Capsule() {
  const [step, setStep] = useState<'name' | 'voice' | 'photo' | 'video' | 'seal'>('name')
  const [name, setName] = useState('')

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <button onClick={() => window.history.back()} className="text-gray-600 text-sm">← back</button>
        <h1 className="text-sm font-light tracking-widest text-gray-400">beside</h1>
        <div className="w-8" />
      </div>

      <div className="flex gap-2 px-6 mb-10">
        {['name', 'voice', 'photo', 'video', 'seal'].map((s, i) => (
          <div key={s} className={`h-0.5 flex-1 transition-all duration-500 ${
            i <= ['name', 'voice', 'photo', 'video', 'seal'].indexOf(step)
            ? 'bg-white' : 'bg-gray-800'
          }`} />
        ))}
      </div>

      {step === 'name' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Step 1</p>
          <h2 className="text-3xl font-light mb-2">What do we call you?</h2>
          <p className="text-sm text-gray-500 mb-12">First name or nickname. Just something real.</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            className="bg-transparent border-b border-gray-700 text-white text-center text-xl pb-3 mb-12 w-48 outline-none placeholder-gray-700 focus:border-gray-400 transition-colors"
          />
          <button
            onClick={() => name.trim() && setStep('voice')}
            className={`border text-sm px-10 py-4 rounded-full transition-all duration-300 ${
              name.trim() ? 'border-white text-white hover:bg-white hover:text-black' : 'border-gray-800 text-gray-700'
            }`}
          >
            Continue
          </button>
        </div>
      )}

      {step === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Step 2 · Voice</p>
          <h2 className="text-3xl font-light mb-2">Say something, {name}.</h2>
          <p className="text-sm text-gray-500 mb-16">One take. No edits.</p>
          <button onClick={() => setStep('photo')} className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center mb-12 hover:border-white transition-colors">
            <div className="w-4 h-4 rounded-full bg-red-500" />
          </button>
          <p className="text-xs text-gray-700">tap to record</p>
        </div>
      )}

      {step === 'photo' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Step 3 · Photo</p>
          <h2 className="text-3xl font-light mb-2">Who's beside you?</h2>
          <p className="text-sm text-gray-500 mb-16">One shot. Make it real.</p>
          <button onClick={() => setStep('video')} className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center mb-12 hover:border-white transition-colors">
            <div className="w-6 h-6 rounded border-2 border-gray-400" />
          </button>
          <p className="text-xs text-gray-700">tap to shoot</p>
        </div>
      )}

      {step === 'video' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Step 4 · Video</p>
          <h2 className="text-3xl font-light mb-2">Last one.</h2>
          <p className="text-sm text-gray-500 mb-16">10 seconds. Just be here.</p>
          <button onClick={() => setStep('seal')} className="w-20 h-20 rounded-full border border-gray-700 flex items-center justify-center mb-12 hover:border-white transition-colors">
            <div className="w-3 h-4 border-t-8 border-b-8 border-l-8 border-transparent border-l-gray-400" />
          </button>
          <p className="text-xs text-gray-700">tap to record</p>
        </div>
      )}

      {step === 'seal' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-gray-600 tracking-widest uppercase mb-8">Ready</p>
          <h2 className="text-3xl font-light mb-2">Seal it.</h2>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed max-w-xs">In 1 month, everyone in this capsule will get a notification.</p>
          <p className="text-xs text-gray-600 mb-16">You'll need to allow notifications to seal.</p>
          <button
            onClick={() => {
              Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                  alert('Capsule sealed. See you in 1 month.')
                }
              })
            }}
            className="border border-white text-white text-sm px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300"
          >
            Seal the Capsule
          </button>
        </div>
      )}
    </main>
    
