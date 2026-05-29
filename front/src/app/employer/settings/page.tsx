'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentUser, changePassword } from '@/apis/auth'

export default function SettingsPage() {
  const [loading, setSaving]  = useState(false)
  const [email,   setEmail]   = useState('')
  const [oldPw,   setOldPw]   = useState('')
  const [newPw,   setNewPw]   = useState('')
  const [conPw,   setConPw]   = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showCon, setShowCon] = useState(false)

  useEffect(() => {
    getCurrentUser().then(r => { if (r?.data) setEmail(r.data.email || '') })
  }, [])

  const pwStrength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 10 ? 2 : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 4 : 3
  const sm = [
    { label: '',       color: 'bg-gray-200' },
    { label: 'Weak',   color: 'bg-red-400' },
    { label: 'Fair',   color: 'bg-orange-400' },
    { label: 'Good',   color: 'bg-blue-400' },
    { label: 'Strong', color: 'bg-green-500' },
  ][pwStrength]

  const handleSave = async () => {
    if (!oldPw || !newPw || !conPw) return toast.error('Please fill all fields')
    if (newPw.length < 8)           return toast.error('Min 8 characters required')
    if (newPw !== conPw)            return toast.error('Passwords do not match')
    setSaving(true)
    try {
      const r = await changePassword(oldPw, newPw, conPw)
      if (r?.success || r?.message?.toLowerCase().includes('success')) {
        toast.success('Password changed successfully!')
        setOldPw(''); setNewPw(''); setConPw('')
      } else {
        toast.error(r?.message || r?.detail || 'Current password is incorrect')
      }
    } catch { toast.error('Failed to change password') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        {email && <p className="text-sm text-gray-400 mt-1">Signed in as <span className="font-medium text-gray-600">{email}</span></p>}
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-500 mt-0.5">Choose a strong password to keep your account secure</p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <PwField label="Current Password"     value={oldPw} onChange={setOldPw} show={showOld} toggle={() => setShowOld(v=>!v)} placeholder="Enter current password" />
          <PwField label="New Password"         value={newPw} onChange={setNewPw} show={showNew} toggle={() => setShowNew(v=>!v)} placeholder="Min 8 characters" />

          {/* Strength bar */}
          {newPw.length > 0 && (
            <div className="space-y-1 -mt-1">
              <div className="flex gap-1.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength ? sm.color : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">Password strength: <span className={`font-semibold ${pwStrength<=1?'text-red-500':pwStrength===2?'text-orange-500':pwStrength===3?'text-blue-500':'text-green-600'}`}>{sm.label}</span></p>
            </div>
          )}

          <PwField label="Confirm New Password" value={conPw} onChange={setConPw} show={showCon} toggle={() => setShowCon(v=>!v)} placeholder="Repeat new password" match={conPw.length > 0 ? newPw === conPw : undefined} />

          {/* Rules */}
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-xl">
            {[
              { t: '8+ characters',   ok: newPw.length >= 8 },
              { t: 'Uppercase letter', ok: /[A-Z]/.test(newPw) },
              { t: 'Number included',  ok: /[0-9]/.test(newPw) },
              { t: 'Passwords match',  ok: newPw.length > 0 && newPw === conPw },
            ].map(r => (
              <div key={r.t} className={`flex items-center gap-2 text-xs font-medium ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                {r.ok
                  ? <CheckCircle2 size={13} className="shrink-0 text-green-500" />
                  : <div className="w-3 h-3 rounded-full border-2 border-gray-300 shrink-0" />}
                {r.t}
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Delete Account - simple link at bottom */}
      <div className="text-center pt-4">
        <button
          onClick={() => toast.error('To delete your account, contact support at support@buzzhire.in')}
          className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors"
        >
          Delete account
        </button>
      </div>

    </div>
  )
}

function PwField({ label, value, onChange, show, toggle, placeholder, match }: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; toggle: () => void; placeholder: string; match?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-11 px-4 pr-20 rounded-xl border text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all ${
            match === false ? 'border-red-300 focus:ring-red-100' :
            match === true  ? 'border-green-400 focus:ring-green-100' :
                              'border-gray-300 focus:ring-indigo-100 focus:border-indigo-400'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {match === false && <AlertCircle size={14} className="text-red-400" />}
          {match === true  && <CheckCircle2 size={14} className="text-green-500" />}
          <button type="button" onClick={toggle} className="text-gray-400 hover:text-gray-600">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
