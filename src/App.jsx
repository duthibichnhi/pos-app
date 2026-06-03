import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Store, ChevronDown, CircleUserRound,
  Sparkles, Mic, Camera, Keyboard,
} from 'lucide-react'

// "Win" tiếng Anh thường bị nhận nhầm thành Quyên/Quin/Wynn
const WAKE_PATTERNS = ['win ơi', 'quyên ơi', 'quin ơi', 'wynn ơi', 'win ới', 'quyên ới', 'quin ới']

function isWakeWord(text) {
  const lower = text.toLowerCase()
  return WAKE_PATTERNS.some(p => lower.includes(p))
}

// Bỏ phần wake word ra khỏi transcript lệnh
function stripWakeWord(text) {
  let result = text.toLowerCase()
  for (const p of WAKE_PATTERNS) {
    result = result.replace(p, '')
  }
  return result.trim()
}

// Trạng thái: 'init' → 'idle' → 'listening' → 'done'
// init: chưa có mic permission
// idle: đang nghe nền chờ wake word
// listening: wake word detected
// done: nhận xong lệnh, 3.5s rồi reset về idle

export default function App() {
  const [phase, setPhase] = useState('init')        // 'init' | 'idle' | 'listening' | 'done'
  const [liveText, setLiveText] = useState('')
  const [finalText, setFinalText] = useState('')
  const [permDenied, setPermDenied] = useState(false)

  const recRef = useRef(null)
  const phaseRef = useRef('init')
  const resetTimerRef = useRef(null)
  const restartTimerRef = useRef(null)

  phaseRef.current = phase

  const clearResetTimer = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
  }

  const scheduleReset = useCallback(() => {
    clearResetTimer()
    resetTimerRef.current = setTimeout(() => {
      setPhase('idle')
      setLiveText('')
      setFinalText('')
    }, 3500)
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

      if (phaseRef.current === 'idle') {
        if (isWakeWord(interim) || isWakeWord(final)) {
          setPhase('listening')
          setLiveText('')
          setFinalText('')
          clearResetTimer()
        }
      } else if (phaseRef.current === 'listening' || phaseRef.current === 'done') {
        const cleanInterim = stripWakeWord(interim)
        const cleanFinal = stripWakeWord(final)
        if (cleanInterim) {
          setLiveText(cleanInterim)
          clearResetTimer()
        }
        if (cleanFinal) {
          setFinalText(prev => (prev + ' ' + cleanFinal).trim())
          setLiveText('')
          setPhase('done')
          scheduleReset()
        }
      }
    }

    rec.onend = () => {
      restartTimerRef.current = setTimeout(() => {
        try { rec.start() } catch (_) {}
      }, 200)
    }

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') { setPermDenied(true); setPhase('init'); return }
      restartTimerRef.current = setTimeout(() => {
        try { rec.start() } catch (_) {}
      }, 800)
    }

    recRef.current = rec
    try { rec.start() } catch (_) {}
  }, [scheduleReset])

  // Auto-start mic khi mount
  useEffect(() => {
    const init = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setPhase('idle')
        startRecognition()
      } catch (_) {
        setPermDenied(true)
      }
    }
    init()
    return () => {
      clearTimeout(resetTimerRef.current)
      clearTimeout(restartTimerRef.current)
      recRef.current?.abort()
    }
  }, [startRecognition])

  // Nhấn mic để grant permission thủ công nếu bị deny lần đầu
  const handleMicClick = async () => {
    if (phase === 'init') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setPermDenied(false)
        setPhase('idle')
        startRecognition()
      } catch (_) { setPermDenied(true) }
    }
  }

  const isListening = phase === 'listening'
  const isDone = phase === 'done'
  const hasTranscript = finalText || liveText
  const displayText = finalText || liveText

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* Topbar */}
      <div className="flex items-center gap-4 px-6 py-6 bg-[#f8fafc] shrink-0">
        <div className="flex items-center h-[60px] w-[448px] bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden shrink-0">
          <div className="flex items-center pl-4 pr-1">
            <Search className="text-slate-400" size={22} strokeWidth={1.8} />
          </div>
          <div className="flex-1 px-3">
            <span className="text-slate-400 text-[15px] select-none">
              Nhập tên sản phẩm hoặc mã SKU
            </span>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors">
            <Store size={22} strokeWidth={1.8} className="text-slate-700" />
            <span className="text-[15px] font-medium text-slate-900 whitespace-nowrap">Tạp hóa dì Thư</span>
            <ChevronDown size={20} strokeWidth={1.8} className="text-slate-700" />
          </button>
          <div className="w-px h-7 bg-slate-300" />
          <button className="flex items-center justify-center w-[60px] h-[60px] rounded-xl hover:bg-slate-100 transition-colors">
            <CircleUserRound size={22} strokeWidth={1.8} className="text-slate-700" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="relative bg-white rounded-3xl h-full flex flex-col overflow-hidden">

          {/* Gradient backdrop */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: '1300px', height: '592px',
              top: '50%', left: '50%',
              transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
              background: 'linear-gradient(-88deg, rgba(253,230,138,0.2) 0%, rgba(253,186,116,0.2) 51%, rgba(251,113,133,0.2) 100%)',
              filter: 'blur(150px)', zIndex: 0,
            }}
          />

          {/* AI Head */}
          <div className="relative z-10 flex items-center px-6 py-[18px] bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={26} strokeWidth={1.8} className="text-amber-500" />
              <span className="text-[17px] font-medium text-slate-900">Trợ lý Win</span>
            </div>
            {/* Mic status */}
            <div className="ml-auto flex items-center gap-1.5">
              {phase === 'init' ? (
                permDenied
                  ? <span className="text-[13px] text-red-400">Cần quyền mic</span>
                  : <span className="text-[13px] text-slate-400">Đang khởi động...</span>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
                  <span className="text-[13px] text-slate-400">{isListening ? 'Đang nghe...' : 'Sẵn sàng'}</span>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col items-center justify-center px-12 py-20 overflow-auto">
              <div className="flex flex-col items-center gap-5 w-full">

                {/* Mic button */}
                <button
                  onClick={handleMicClick}
                  className="relative flex items-center justify-center w-[120px] h-[120px] rounded-full transition-all duration-300 active:scale-95"
                  style={{
                    background: isListening ? '#dc2626' : '#dc2626',
                    boxShadow: isListening
                      ? '0 0 0 0 rgba(220,38,38,0.4)'
                      : '0 4px 6px rgba(26,26,26,0.05), 0 8px 10px rgba(26,26,26,0.05)',
                  }}
                >
                  {/* Pulse rings khi listening */}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping" />
                      <span className="absolute inset-[-8px] rounded-full bg-red-400 opacity-20 animate-ping" style={{ animationDelay: '0.3s' }} />
                    </>
                  )}
                  <Mic size={52} strokeWidth={1.8} className="text-white relative z-10" />
                </button>

                {/* Trạng thái text */}
                <p className="text-[19px] font-semibold text-slate-900 text-center transition-all duration-300">
                  {phase === 'init'
                    ? (permDenied ? 'Nhấn mic để cấp quyền micro' : 'Đang khởi động...')
                    : isListening
                    ? 'Đang nghe...'
                    : isDone
                    ? 'Xong rồi!'
                    : 'Dì Thư nói "Win ơi" để bắt đầu nha'}
                </p>

                {/* Chat bubble khi có transcript */}
                {hasTranscript ? (
                  <div className="w-full max-w-[860px] mt-2">
                    <div
                      className="w-full border border-slate-200 rounded-2xl p-6 text-[17px] text-slate-800 leading-relaxed min-h-[64px]"
                      style={{ backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.85)' }}
                    >
                      {displayText}
                      {isListening && liveText && (
                        <span className="text-slate-400"> ...</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Guide cards khi idle */
                  <div className="grid grid-cols-3 gap-4 w-full max-w-[860px] mt-4">
                    <div
                      className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-2.5"
                      style={{ backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.7)' }}
                    >
                      <p className="text-[16px] font-semibold text-slate-900">🛍️ Bán hàng</p>
                      <p className="text-[14px] italic text-slate-700 leading-relaxed">
                        &ldquo;Bình mua 1 chai nước mắm 49 ngàn, 2 trứng gà&rdquo;
                      </p>
                    </div>
                    <div
                      className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-2.5"
                      style={{ backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.7)' }}
                    >
                      <p className="text-[16px] font-semibold text-slate-900">📦 Kiểm tồn kho và đặt hàng</p>
                      <div className="flex flex-col gap-0.5 text-[14px] italic text-slate-700 leading-relaxed">
                        <p>&ldquo;Tương ớt còn bao nhiêu chai?&rdquo;</p>
                        <p>&ldquo;Đặt thêm 1 thùng Chinsu đỏ&rdquo;</p>
                      </div>
                    </div>
                    <div
                      className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-2.5"
                      style={{ backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.7)' }}
                    >
                      <p className="text-[16px] font-semibold text-slate-900">💰 Quản lý tiền</p>
                      <div className="flex flex-col gap-0.5 text-[14px] italic text-slate-700 leading-relaxed">
                        <p>&ldquo;Bình còn nợ nhiêu tiền hàng?&rdquo;</p>
                        <p>&ldquo;Doanh thu hôm nay nhiêu?&rdquo;</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hướng dẫn khi bị deny permission */}
                {permDenied && (
                  <p className="text-[13px] text-red-400 text-center mt-1">
                    Vào Settings → cho phép truy cập microphone rồi tải lại trang
                  </p>
                )}
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-center pb-12 pt-4 shrink-0">
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 transition-colors text-slate-900">
                  <Camera size={20} strokeWidth={1.8} />
                  <span className="text-[15px] font-medium whitespace-nowrap">Chụp tạo đơn</span>
                </button>
                <div className="w-px h-6 bg-slate-200" />
                <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 transition-colors text-slate-900">
                  <Keyboard size={20} strokeWidth={1.8} />
                  <span className="text-[15px] font-medium whitespace-nowrap">Nhập tin nhắn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
