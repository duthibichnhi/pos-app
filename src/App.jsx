import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Store, ChevronDown, CircleUserRound,
  Sparkles, Mic, Camera, Keyboard, AudioLines, SquarePen,
} from 'lucide-react'
import Lottie from 'lottie-react'
import audioLiveIcon from './assets/audio-live-icon.json'

const WAKE_PATTERNS = [
  'win oi', 'quyen oi', 'quin oi', 'wynn oi',
  'win oi', 'quyen oi', 'quin oi', 'wynn oi',
]

function isWakeWord(text) {
  const lower = text.toLowerCase()
  return WAKE_PATTERNS.some(p => lower.includes(p))
    || lower.includes('win') && lower.includes('oi')
    || lower.includes('quyen') && lower.includes('oi')
    || lower.includes('quin') && lower.includes('oi')
}

function stripWakeWord(text) {
  let r = text.toLowerCase()
  for (const p of WAKE_PATTERNS) r = r.replace(p, '')
  return r.replace(/\bwin\b.*?\boi\b/i, '').replace(/\bquyen\b.*?\boi\b/i, '').trim()
}

// phases: init | idle | listening | submitted
export default function App() {
  const [phase, setPhase] = useState('init')
  const [messages, setMessages] = useState([])
  const [liveText, setLiveText] = useState('')
  const [draftText, setDraftText] = useState('')
  const [permDenied, setPermDenied] = useState(false)

  const recRef = useRef(null)
  const phaseRef = useRef('init')
  const draftRef = useRef('')
  const silenceTimerRef = useRef(null)
  const restartTimerRef = useRef(null)
  const messagesEndRef = useRef(null)

  phaseRef.current = phase
  draftRef.current = draftText

  const clearSilenceTimer = () => clearTimeout(silenceTimerRef.current)

  const scheduleSilenceSubmit = useCallback(() => {
    clearSilenceTimer()
    silenceTimerRef.current = setTimeout(() => {
      const text = draftRef.current.trim()
      if (!text) { setPhase('idle'); return }
      setMessages(prev => [...prev, { id: Date.now(), text }])
      setDraftText('')
      setLiveText('')
      setPhase('submitted')
    }, 3000)
  }, [])

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'vi-VN'

    rec.onresult = (e) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }

      const cur = phaseRef.current

      if (cur === 'idle' || cur === 'submitted') {
        if (isWakeWord(interim) || isWakeWord(final)) {
          setDraftText('')
          setLiveText('')
          clearSilenceTimer()
          setPhase('listening')
        }
      } else if (cur === 'listening') {
        const cleanInterim = stripWakeWord(interim)
        const cleanFinal = stripWakeWord(final)
        if (cleanInterim) {
          setLiveText(cleanInterim)
          clearSilenceTimer()
        }
        if (cleanFinal) {
          setDraftText(prev => (prev + ' ' + cleanFinal).trim())
          setLiveText('')
          scheduleSilenceSubmit()
        }
      }
    }

    rec.onend = () => {
      restartTimerRef.current = setTimeout(() => { try { rec.start() } catch (_) {} }, 200)
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') { setPermDenied(true); setPhase('init'); return }
      restartTimerRef.current = setTimeout(() => { try { rec.start() } catch (_) {} }, 800)
    }

    recRef.current = rec
    try { rec.start() } catch (_) {}
  }, [scheduleSilenceSubmit])

  useEffect(() => {
    const init = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setPhase('idle')
        startRecognition()
      } catch (_) { setPermDenied(true) }
    }
    init()
    return () => {
      clearTimeout(silenceTimerRef.current)
      clearTimeout(restartTimerRef.current)
      recRef.current?.abort()
    }
  }, [startRecognition])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleMicClick = async () => {
    if (phase !== 'init') return
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermDenied(false)
      setPhase('idle')
      startRecognition()
    } catch (_) { setPermDenied(true) }
  }

  const isListening = phase === 'listening'
  const displayText = (draftText + (liveText ? ' ' + liveText : '')).trim()
  const showTwoCol = phase === 'submitted' || (isListening && messages.length > 0)

  // ─── Topbar ───────────────────────────────────────────────────
  const Topbar = (
    <div className="flex items-center gap-4 px-6 py-6 bg-[#f8fafc] shrink-0">
      <div className="flex items-center h-[60px] w-[448px] bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden shrink-0">
        <div className="flex items-center pl-4 pr-1">
          <Search className="text-slate-400" size={22} strokeWidth={1.8} />
        </div>
        <div className="flex-1 px-3">
          <span className="text-slate-400 text-[15px] select-none">Nhap ten san pham hoac ma SKU</span>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors">
          <Store size={22} strokeWidth={1.8} className="text-slate-700" />
          <span className="text-[15px] font-medium text-slate-900 whitespace-nowrap">Tap hoa di Thu</span>
          <ChevronDown size={20} strokeWidth={1.8} className="text-slate-700" />
        </button>
        <div className="w-px h-7 bg-slate-300" />
        <button className="flex items-center justify-center w-[60px] h-[60px] rounded-xl hover:bg-slate-100 transition-colors">
          <CircleUserRound size={22} strokeWidth={1.8} className="text-slate-700" />
        </button>
      </div>
    </div>
  )

  // ─── 2-col layout ─────────────────────────────────────────────
  if (showTwoCol) {
    return (
      <div className="flex flex-col h-screen bg-[#f8fafc]">
        {Topbar}
        <div className="flex-1 grid grid-cols-[2fr_1fr] gap-6 px-6 pb-6 min-h-0">

          {/* Left: AI Chat */}
          <div className="relative bg-white rounded-3xl flex flex-col min-h-0 overflow-hidden">
            <div className="absolute pointer-events-none rounded-full" style={{
              width: 1300, height: 592, top: '50%', left: '50%',
              transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
              background: 'linear-gradient(-88deg,rgba(253,230,138,0.15) 0%,rgba(253,186,116,0.15) 51%,rgba(251,113,133,0.15) 100%)',
              filter: 'blur(150px)', zIndex: 0,
            }} />
            {/* Fade overlay top */}
            <div className="absolute top-0 left-0 right-0 h-[80px] pointer-events-none z-10"
              style={{ background: 'linear-gradient(to bottom,white 0%,transparent 100%)' }} />

            {/* Header */}
            <div className="relative z-20 flex items-center pl-6 pr-[18px] py-[18px] bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={26} strokeWidth={1.8} className="text-amber-500" />
                <span className="text-[17px] font-medium text-slate-900">Tro ly Win</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
                <span className="text-[13px] text-slate-400">{isListening ? 'Dang nghe...' : 'San sang'}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="relative z-10 flex-1 overflow-y-auto px-12 py-6 flex flex-col justify-end min-h-0">
              <div className="flex flex-col gap-4">
                {messages.map(msg => (
                  <div key={msg.id} className="flex justify-end pl-16">
                    <div className="bg-slate-100 rounded-3xl px-4 py-3 text-[17px] text-slate-800 leading-relaxed tracking-tight">
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isListening && displayText && (
                  <div className="flex justify-end pl-16">
                    <div className="bg-slate-100 rounded-3xl px-4 py-3 text-[17px] text-slate-400 leading-relaxed tracking-tight italic">
                      {displayText}<span className="animate-pulse"> ...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom gradient + action bar */}
            <div className="relative z-20 shrink-0">
              <div className="absolute bottom-full left-0 right-0 h-[120px] pointer-events-none"
                style={{ background: 'linear-gradient(to top,rgba(255,255,255,0.98) 0%,transparent 100%)' }} />
              <div className="flex items-center justify-center pb-12 pt-[18px] bg-white">
                <div className="flex items-center border border-slate-200 bg-white rounded-2xl shadow-sm gap-0">
                  <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 rounded-l-2xl transition-colors text-slate-900">
                    <Camera size={20} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium whitespace-nowrap">Chup tao don</span>
                  </button>
                  <div className="w-px h-6 bg-slate-200" />
                  {/* Record button — Lottie khi listening, static khi idle */}
                  <div className="flex items-center justify-center px-3">
                    <div className="relative" style={{ width: 84, height: 84 }}>
                      {isListening ? (
                        // Lottie canvas 120px, circle bên trong 84px → offset -18px để căn giữa đúng
                        <div style={{ position: 'absolute', top: -18, left: -18, width: 120, height: 120, pointerEvents: 'none' }}>
                          <Lottie animationData={audioLiveIcon} loop={true} />
                        </div>
                      ) : (
                        <button
                          className="flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all"
                          style={{ width: 84, height: 84, boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}
                        >
                          <AudioLines size={36} strokeWidth={1.8} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 rounded-r-2xl transition-colors text-slate-900">
                    <Keyboard size={20} strokeWidth={1.8} />
                    <span className="text-[15px] font-medium whitespace-nowrap">Nhap tin nhan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Cart */}
          <div className="flex flex-col bg-white rounded-3xl overflow-hidden min-h-0">
            <div className="flex items-center gap-3 pl-6 pr-[18px] py-[18px] border-b border-slate-200 shrink-0">
              <p className="flex-1 text-[16px] font-semibold text-slate-900 truncate">Don hang moi</p>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors">
                <SquarePen size={18} strokeWidth={1.8} className="text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 min-h-0 flex items-center justify-center">
              <p className="text-[14px] text-slate-400 italic text-center">Dang xu ly don hang...</p>
            </div>
            <div className="flex items-center gap-6 pl-6 pr-[18px] py-[18px] border-t border-slate-200 shrink-0">
              <div className="flex-1 flex items-center justify-between">
                <span className="text-[15px] text-slate-700">Tong tien:</span>
                <span className="text-[15px] font-semibold text-red-600">--</span>
              </div>
              <button className="flex items-center h-[60px] px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm">
                <span className="text-[15px] font-medium whitespace-nowrap">Thanh toan</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ─── 1-col layout (idle / listening) ──────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {Topbar}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="relative bg-white rounded-3xl h-full flex flex-col overflow-hidden">
          <div className="absolute pointer-events-none rounded-full" style={{
            width: 1300, height: 592, top: '50%', left: '50%',
            transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
            background: 'linear-gradient(-88deg,rgba(253,230,138,0.2) 0%,rgba(253,186,116,0.2) 51%,rgba(251,113,133,0.2) 100%)',
            filter: 'blur(150px)', zIndex: 0,
          }} />

          {/* Header */}
          <div className="relative z-10 flex items-center px-6 py-[18px] bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={26} strokeWidth={1.8} className="text-amber-500" />
              <span className="text-[17px] font-medium text-slate-900">Tro ly Win</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {phase === 'init' ? (
                permDenied
                  ? <span className="text-[13px] text-red-400">Can quyen mic</span>
                  : <span className="text-[13px] text-slate-400">Dang khoi dong...</span>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
                  <span className="text-[13px] text-slate-400">{isListening ? 'Dang nghe...' : 'San sang'}</span>
                </>
              )}
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col items-center justify-center px-12 py-20 overflow-auto">
              <div className="flex flex-col items-center gap-5 w-full">
                {/* Big mic — Lottie khi listening, static Mic khi idle */}
                {isListening ? (
                  <button
                    onClick={handleMicClick}
                    style={{ width: 120, height: 120, background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Lottie animationData={audioLiveIcon} loop={true} style={{ width: 120, height: 120 }} />
                  </button>
                ) : (
                  <button
                    onClick={handleMicClick}
                    className="flex items-center justify-center w-[120px] h-[120px] rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-300"
                    style={{ boxShadow: '0 4px 6px rgba(26,26,26,0.05),0 8px 10px rgba(26,26,26,0.05)' }}
                  >
                    <Mic size={52} strokeWidth={1.8} className="text-white" />
                  </button>
                )}

                <p className="text-[19px] font-semibold text-slate-900 text-center">
                  {phase === 'init'
                    ? (permDenied ? 'Nhan mic de cap quyen micro' : 'Dang khoi dong...')
                    : isListening ? 'Dang nghe...'
                    : 'Di Thu noi "Win oi" de bat dau nha'}
                </p>

                {isListening && displayText ? (
                  <div className="w-full max-w-[860px] mt-2">
                    <div className="border border-slate-200 rounded-2xl p-6 text-[17px] text-slate-800 leading-relaxed"
                      style={{ backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.85)' }}>
                      {displayText}<span className="text-slate-400 animate-pulse"> ...</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 w-full max-w-[860px] mt-4">
                    {[
                      { t: '🛍️ Ban hang', b: '"Binh mua 1 chai nuoc mam 49 ngan, 2 trung ga"' },
                      { t: '📦 Kiem ton kho va dat hang', b: '"Tuong ot con bao nhieu chai?"\n"Dat them 1 thung Chinsu do"' },
                      { t: '💰 Quan ly tien', b: '"Binh con no nhieu tien hang?"\n"Doanh thu hom nay nhieu?"' },
                    ].map((c, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-2.5"
                        style={{ backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.7)' }}>
                        <p className="text-[16px] font-semibold text-slate-900">{c.t}</p>
                        <p className="text-[14px] italic text-slate-700 leading-relaxed whitespace-pre-line">{c.b}</p>
                      </div>
                    ))}
                  </div>
                )}

                {permDenied && (
                  <p className="text-[13px] text-red-400 text-center mt-1">
                    Vao Settings cap quyen microphone roi tai lai trang
                  </p>
                )}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-center pb-12 pt-4 shrink-0">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 transition-colors text-slate-900">
                  <Camera size={20} strokeWidth={1.8} />
                  <span className="text-[15px] font-medium whitespace-nowrap">Chup tao don</span>
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 transition-colors text-slate-900">
                  <Keyboard size={20} strokeWidth={1.8} />
                  <span className="text-[15px] font-medium whitespace-nowrap">Nhap tin nhan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
