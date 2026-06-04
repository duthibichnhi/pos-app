import { useState, useEffect, useRef } from 'react'
import { Sparkles, AudioLines, Camera, Keyboard, SquarePen, Check } from 'lucide-react'
import Lottie from 'lottie-react'
import audioLiveIcon from './assets/audio-live-icon.json'

// ─── Product catalog ────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: 'Mì Kokomi tôm chua cay', basePrice: 5000, qty: 2, unit: 'gói', emoji: '🍜', color: '#fef3c7' },
  { id: 2, name: 'Coca Cola vị nguyên bản',  basePrice: 10000, qty: 2, unit: 'lon', emoji: '🥤', color: '#fee2e2' },
  { id: 3, name: 'Trứng gà ta',               basePrice: null,  qty: 2, unit: 'trái', emoji: '🥚', color: '#fef9c3' },
]

// ─── Simulation steps ───────────────────────────────────────────
// dur: ms to stay, user speech times estimated from word count (~3 words/s)
// rightMode: 'dashboard' | 'camera' | 'review' | 'cart' | 'done'
// msgs: new messages to append this step
// patch: state changes this step

const STEPS = [
  // 0 — Default idle (2s)
  { dur: 2000, rightMode: 'dashboard', aiStatus: 'idle', msgs: [] },

  // 1 — Nhi gọi hàng (~4s)
  { dur: 4000, msgs: [{ role: 'customer', speaker: 'Nhi',
    text: 'Dì Thư ơi, cho con mấy cái này, với con lấy 2 trái trứng gà ta nữa. Tính tiền cho con' }],
    aiStatus: 'listening', note: 'Đang nghe...' },

  // 2 — Dì Thư trả lời (~2s)
  { dur: 2000, msgs: [{ role: 'store', speaker: 'Dì Thư', text: 'Ok. Trứng nè con.' }],
    note: 'Dì Thư chuẩn bị chụp ảnh...' },

  // 3 — Camera (3s — Dì Thư chụp)
  { dur: 3000, rightMode: 'camera', msgs: [], aiStatus: 'listening', note: 'Đang chụp ảnh sản phẩm...' },

  // 4 — Review image (1.5s — AI nhận diện)
  { dur: 1500, rightMode: 'review', msgs: [], aiStatus: 'active', note: 'AI đang nhận diện...' },

  // 5 — AI lên đơn nhanh (1.5s)
  { dur: 1500, rightMode: 'cart', showItems: [1, 2, 3],
    msgs: [{ role: 'ai', text: 'Tạo đơn cho Nhi con bà Năm' }],
    aiStatus: 'active', note: 'Đang lên đơn...' },

  // 6 — AI cảnh báo thiếu giá (2s)
  { dur: 2000,
    msgs: [{ role: 'ai', text: 'Chưa có giá trứng gà ta', type: 'warning' }],
    aiStatus: 'active', note: 'Hỏi giá trứng...' },

  // 7 — Dì Thư báo giá (~2s)
  { dur: 2000, msgs: [{ role: 'store', speaker: 'Dì Thư', text: '4k một trái nhen' }],
    note: 'Dì Thư báo giá...' },

  // 8 — AI tính nhanh (0.8s)
  { dur: 800, setPrices: { 3: 4000 }, aiStatus: 'active', msgs: [], note: 'AI đang tính...' },

  // 9 — AI thông báo tổng (1.5s)
  { dur: 1500, setTotal: 38000,
    msgs: [{ role: 'ai', text: 'Tổng đơn 38.000₫' }],
    aiStatus: 'active', note: 'Tổng 38k' },

  // 10 — AI nhắc tích điểm (1.5s)
  { dur: 1500,
    msgs: [{ role: 'ai', text: 'Xin số điện thoại khách để tích điểm' }],
    aiStatus: 'active', note: 'Nhắc tích điểm...' },

  // 11 — Dì Thư hỏi Nhi (~3s)
  { dur: 3000,
    msgs: [{ role: 'store', speaker: 'Dì Thư', text: 'Mua Mì Đỏ tích điểm đó, mày tích không con?' }],
    note: 'Dì Thư hỏi khách...' },

  // 12 — Nhi đồng ý (~2s)
  { dur: 2000, msgs: [{ role: 'customer', speaker: 'Nhi', text: 'Dạ có, tích điểm sao dì' }],
    note: 'Khách đồng ý tích điểm...' },

  // 13 — Dì Thư hỏi SĐT (~2s)
  { dur: 2000, msgs: [{ role: 'store', speaker: 'Dì Thư', text: 'Mày đọc dì số điện thoại' }],
    note: 'Hỏi số điện thoại...' },

  // 14 — Nhi đọc SĐT (~3s)
  { dur: 3000,
    msgs: [{ role: 'customer', speaker: 'Nhi', text: 'Dạ số con là 0986577626' }],
    aiStatus: 'listening', note: 'Đang nghe SĐT...' },

  // 15 — AI ghi SĐT nhanh (0.8s)
  { dur: 800, setPhone: '0986577626', aiStatus: 'active', msgs: [], note: 'AI ghi SĐT...' },

  // 16 — Nhi xin mua thiếu (~4s — dài)
  { dur: 4000,
    msgs: [{ role: 'customer', speaker: 'Nhi',
      text: 'Dì cho con mua thiếu nha, má con lên Sài Gòn rồi mai mới về' }],
    aiStatus: 'listening', note: 'Đang nghe...' },

  // 17 — Dì Thư xác nhận nợ (~3s) → AI parse tên + ghi nợ
  { dur: 3000,
    msgs: [{ role: 'store', speaker: 'Dì Thư', text: 'Ok. Nhi con bà Năm thiếu 38k nhen' }],
    aiStatus: 'listening', note: 'Đang nghe...' },

  // 18 — AI fill tên khách nhanh (1s)
  { dur: 1000, setName: 'Nhi con bà Năm', aiStatus: 'active', msgs: [], note: 'AI xử lý...' },

  // 19 — AI thông báo hoàn tất (1.5s)
  { dur: 1500,
    msgs: [{ role: 'ai', text: 'Ghi sổ nợ hoàn tất!', type: 'success' }],
    aiStatus: 'active', note: 'Hoàn tất!' },

  // 20 — Done screen (4s)
  { dur: 4000, rightMode: 'done', msgs: [], aiStatus: 'idle', note: null },

  // 21 — Về Default updated (3s rồi loop)
  { dur: 3000, rightMode: 'dashboard_updated', msgs: [], aiStatus: 'idle', note: null },
]

// ─── Topbar component ───────────────────────────────────────────
function Topbar() {
  return (
    <div className="flex items-center gap-4 px-6 py-6 bg-[#f8fafc] shrink-0">
      <div className="flex items-center h-[60px] w-[448px] bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden shrink-0">
        <div className="flex items-center pl-4 pr-1">
          <svg className="text-slate-400 w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div className="flex-1 px-3">
          <span className="text-slate-400 text-[15px] select-none">Nhập tên sản phẩm hoặc mã SKU</span>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100">
          <svg className="w-[22px] h-[22px] text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span className="text-[15px] font-medium text-slate-900 whitespace-nowrap">Tạp hóa dì Thư</span>
          <svg className="w-[20px] h-[20px] text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
        <div className="w-px h-7 bg-slate-300" />
        <button className="flex items-center justify-center w-[60px] h-[60px] rounded-xl hover:bg-slate-100">
          <svg className="w-[22px] h-[22px] text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Chat message component ─────────────────────────────────────
function ChatMsg({ msg, visible }) {
  const isAi = msg.role === 'ai'
  const isWarning = msg.type === 'warning'
  const isSuccess = msg.type === 'success'

  return (
    <div
      className={`flex transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${isAi ? 'justify-start' : 'justify-end'}`}
    >
      {isAi && (
        <div className={`flex items-start gap-2 max-w-[85%]`}>
          <div className="mt-1 shrink-0">
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 text-[15px] leading-snug
            ${isWarning ? 'bg-orange-50 border border-orange-200 text-orange-700' :
              isSuccess ? 'bg-green-50 border border-green-200 text-green-700' :
              'bg-slate-100 text-slate-800'}`}>
            {msg.text}
          </div>
        </div>
      )}
      {!isAi && (
        <div className="flex flex-col items-end gap-1 max-w-[85%]">
          <span className="text-[11px] text-slate-400 px-1">{msg.speaker}</span>
          <div className={`rounded-2xl rounded-tr-sm px-4 py-2.5 text-[15px] leading-snug
            ${msg.role === 'store' ? 'bg-blue-50 border border-blue-100 text-slate-700' :
              'bg-slate-50 border border-slate-200 text-slate-600'}`}>
            {msg.text}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Cart item component ────────────────────────────────────────
function CartItem({ product, visible, priceOverride }) {
  const price = priceOverride ?? product.basePrice
  return (
    <div className={`transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}
      border-b border-slate-100 py-3 last:border-0`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: product.color }}>
          {product.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-slate-800 truncate">{product.name}</p>
          <p className="text-[13px] text-slate-400">{product.qty} {product.unit}</p>
        </div>
        <div className="text-right shrink-0">
          {price ? (
            <p className="text-[14px] font-medium text-slate-800">
              {(price * product.qty).toLocaleString('vi-VN')}₫
            </p>
          ) : (
            <p className="text-[12px] text-orange-400 font-medium">Chưa có giá</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Simulation component ──────────────────────────────────
export default function Simulation() {
  const [stepIdx, setStepIdx]   = useState(0)
  const [messages, setMessages] = useState([])
  const [visibleMsgs, setVisibleMsgs] = useState(new Set())
  const [rightMode, setRightMode] = useState('dashboard')
  const [aiStatus, setAiStatus] = useState('idle')
  const [note, setNote]         = useState(null)
  const [shownItems, setShownItems] = useState(new Set())
  const [prices, setPrices]     = useState({})
  const [total, setTotal]       = useState(null)
  const [phone, setPhone]       = useState(null)
  const [custName, setCustName] = useState(null)

  const timerRef = useRef(null)
  const msgEndRef = useRef(null)

  // Apply a step
  const applyStep = (idx) => {
    if (idx >= STEPS.length) {
      // Loop: reset after last step
      setTimeout(() => {
        setStepIdx(0)
        setMessages([])
        setVisibleMsgs(new Set())
        setRightMode('dashboard')
        setAiStatus('idle')
        setNote(null)
        setShownItems(new Set())
        setPrices({})
        setTotal(null)
        setPhone(null)
        setCustName(null)
      }, 500)
      return
    }

    const step = STEPS[idx]

    // Apply state patches
    if (step.rightMode !== undefined) setRightMode(step.rightMode)
    if (step.aiStatus  !== undefined) setAiStatus(step.aiStatus)
    if (step.note      !== undefined) setNote(step.note)
    if (step.showItems) setShownItems(prev => new Set([...prev, ...step.showItems]))
    if (step.setPrices) setPrices(prev => ({ ...prev, ...step.setPrices }))
    if (step.setTotal  !== undefined) setTotal(step.setTotal)
    if (step.setPhone  !== undefined) setPhone(step.setPhone)
    if (step.setName   !== undefined) setCustName(step.setName)

    // Append new messages
    if (step.msgs?.length) {
      setMessages(prev => {
        const newMsgs = step.msgs.map((m, i) => ({ ...m, id: `${idx}-${i}` }))
        return [...prev, ...newMsgs]
      })
      // Animate in with slight delay
      setTimeout(() => {
        setVisibleMsgs(prev => {
          const next = new Set(prev)
          step.msgs.forEach((_, i) => next.add(`${idx}-${i}`))
          return next
        })
      }, 100)
    }

    // Advance to next step
    timerRef.current = setTimeout(() => {
      setStepIdx(i => i + 1)
    }, step.dur)
  }

  useEffect(() => {
    applyStep(stepIdx)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx])

  // Auto-scroll chat
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isListening  = aiStatus === 'listening'
  const isProcessing = aiStatus === 'active'
  const isCart  = rightMode === 'cart' || rightMode === 'done'
  const isDone  = rightMode === 'done'
  const isDash  = rightMode === 'dashboard' || rightMode === 'dashboard_updated'
  const isCamera = rightMode === 'camera'
  const isReview = rightMode === 'review'
  const updatedDash = rightMode === 'dashboard_updated'

  const totalCalc = total ?? (
    shownItems.size > 0 ? PRODUCTS.filter(p => shownItems.has(p.id)).reduce((s, p) => {
      const pr = prices[p.id] ?? p.basePrice
      return s + (pr ? pr * p.qty : 0)
    }, 0) : null
  )

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      <Topbar />

      <div className="flex-1 grid grid-cols-[2fr_1fr] gap-6 px-6 pb-6 min-h-0">

        {/* ── Left: AI Chat ── */}
        <div className="relative bg-white rounded-3xl flex flex-col min-h-0 overflow-hidden">
          {/* Gradient */}
          <div className="absolute pointer-events-none rounded-full" style={{
            width: 1300, height: 592, top: '50%', left: '50%',
            transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
            background: 'linear-gradient(-88deg,rgba(253,230,138,0.15) 0%,rgba(253,186,116,0.15) 51%,rgba(251,113,133,0.15) 100%)',
            filter: 'blur(150px)', zIndex: 0,
          }} />

          {/* Header */}
          <div className="relative z-20 flex items-center pl-6 pr-[18px] py-[18px] bg-white shrink-0 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Sparkles size={24} strokeWidth={1.8} className="text-amber-500" />
              <span className="text-[17px] font-medium text-slate-900">Trợ lý Win</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {isListening && <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>}
              {isProcessing && <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>}
              {!isListening && !isProcessing && <span className="inline-flex rounded-full h-2 w-2 bg-green-400" />}
              <span className="text-[13px] text-slate-400">
                {isListening ? 'Đang nghe...' : isProcessing ? 'Đang xử lý...' : 'Sẵn sàng'}
              </span>
            </div>
          </div>

          {/* Camera / Review overlay */}
          {(isCamera || isReview) && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 rounded-3xl">
              {isCamera && (
                <>
                  <div className="relative w-[320px] h-[320px] rounded-2xl border-2 border-white/30 overflow-hidden bg-zinc-900 flex items-center justify-center">
                    {/* Simulated viewfinder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                    <div className="text-6xl opacity-60">📦</div>
                    {/* Corner markers */}
                    {['tl','tr','bl','br'].map(c => (
                      <div key={c} className={`absolute w-6 h-6 border-white/80
                        ${c === 'tl' ? 'top-3 left-3 border-t-2 border-l-2' :
                          c === 'tr' ? 'top-3 right-3 border-t-2 border-r-2' :
                          c === 'bl' ? 'bottom-3 left-3 border-b-2 border-l-2' :
                          'bottom-3 right-3 border-b-2 border-r-2'}`} />
                    ))}
                  </div>
                  <p className="mt-4 text-white/70 text-[14px]">Đang chụp ảnh sản phẩm...</p>
                </>
              )}
              {isReview && (
                <>
                  <div className="relative w-[320px] h-[320px] rounded-2xl overflow-hidden bg-zinc-800 flex items-center justify-center">
                    <div className="text-[80px]">🛒</div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 px-4">
                      <div className="flex gap-2">
                        {PRODUCTS.map(p => (
                          <span key={p.id} className="text-[13px] bg-white/20 text-white px-2 py-0.5 rounded-full">
                            {p.emoji} nhận diện...
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-white/70 text-[14px]">AI đang nhận diện sản phẩm...</p>
                </>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-end min-h-0">
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-8">
                <p className="text-[18px] font-semibold text-slate-800 text-center">
                  Bạn cứ nói và trợ lý Win sẽ làm theo
                </p>
                <p className="text-[14px] text-slate-400 text-center">Đang lắng nghe...</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {messages.map(msg => (
                <ChatMsg key={msg.id} msg={msg} visible={visibleMsgs.has(msg.id)} />
              ))}
              <div ref={msgEndRef} />
            </div>
          </div>

          {/* Note / caption pill */}
          {note && (
            <div className="relative z-20 flex justify-center pb-2">
              <span className="text-[12px] text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                {note}
              </span>
            </div>
          )}

          {/* Bottom action bar */}
          <div className="relative z-20 flex items-center justify-center pb-8 pt-3 bg-white shrink-0">
            <div className="flex items-center border border-slate-200 bg-white rounded-2xl shadow-sm">
              <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 rounded-l-2xl text-slate-900">
                <Camera size={20} strokeWidth={1.8} />
                <span className="text-[15px] font-medium">Chụp tạo đơn</span>
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex items-center justify-center px-3">
                <div className="relative" style={{ width: 84, height: 84 }}>
                  {isListening || isProcessing ? (
                    <div style={{ position: 'absolute', top: -18, left: -18, width: 120, height: 120, pointerEvents: 'none' }}>
                      <Lottie animationData={audioLiveIcon} loop={true} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-full bg-red-600 w-[84px] h-[84px]"
                      style={{ boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}>
                      <AudioLines size={36} strokeWidth={1.8} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <button className="flex items-center gap-3 h-[60px] px-6 hover:bg-slate-50 rounded-r-2xl text-slate-900">
                <Keyboard size={20} strokeWidth={1.8} />
                <span className="text-[15px] font-medium">Nhập tin nhắn</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col bg-white rounded-3xl overflow-hidden min-h-0">

          {/* DASHBOARD */}
          {isDash && (
            <>
              <div className="flex items-center gap-3 pl-6 pr-[18px] py-[18px] border-b border-slate-100 shrink-0">
                <p className="flex-1 text-[16px] font-semibold text-slate-900">Tổng quan hôm nay</p>
              </div>
              <div className="flex-1 px-6 py-6 flex flex-col gap-4 overflow-y-auto">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5">
                  <p className="text-[13px] text-slate-500 mb-1">Doanh thu hôm nay</p>
                  <p className="text-[28px] font-bold text-slate-900">
                    {updatedDash ? '694.000' : '656.000'}₫
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Đã bán {updatedDash ? '10' : '9'} đơn
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {['📦 Quản lý kho', '💰 Sổ nợ', '📊 Báo cáo'].map(t => (
                    <div key={t} className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-[12px] text-slate-600 leading-tight">{t}</p>
                    </div>
                  ))}
                </div>
                {updatedDash && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <Check size={18} className="text-green-600 shrink-0" />
                    <p className="text-[14px] text-green-700 font-medium">Ghi đơn hoàn tất!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* CART */}
          {(isCart || (!isDash && !isCamera && !isReview)) && !isDash && (
            <>
              {/* Cart header */}
              <div className="flex items-center gap-3 pl-6 pr-[18px] py-[18px] border-b border-slate-100 shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-slate-900 truncate">
                    {custName || 'Đơn hàng mới'}
                  </p>
                  {phone && <p className="text-[13px] text-slate-400">{phone}</p>}
                </div>
                <button className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100">
                  <SquarePen size={16} strokeWidth={1.8} className="text-slate-500" />
                </button>
              </div>

              {/* Product list */}
              <div className="flex-1 overflow-y-auto px-6 min-h-0">
                {shownItems.size === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[14px] text-slate-400 italic">Đang xử lý đơn hàng...</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {PRODUCTS.map(p => (
                      <CartItem
                        key={p.id}
                        product={p}
                        visible={shownItems.has(p.id)}
                        priceOverride={prices[p.id]}
                      />
                    ))}
                  </div>
                )}

                {/* Done confirmations */}
                {isDone && (
                  <div className="flex flex-col gap-3 py-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                      <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[14px] font-semibold text-green-800">Đã ghi sổ nợ</p>
                        <p className="text-[13px] text-green-700 mt-0.5">{custName} — 38.000₫</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <Check size={18} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[14px] font-semibold text-blue-800">Đã gửi SMS tích điểm</p>
                        <p className="text-[13px] text-blue-700 mt-0.5">→ {phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart footer */}
              <div className="flex items-center gap-4 pl-6 pr-[18px] py-[18px] border-t border-slate-100 bg-white shrink-0">
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[15px] text-slate-600">Tổng tiền:</span>
                  <span className={`text-[15px] font-bold ${totalCalc ? 'text-red-600' : 'text-slate-400'}`}>
                    {totalCalc ? `${totalCalc.toLocaleString('vi-VN')}₫` : '--'}
                  </span>
                </div>
                <button className={`flex items-center h-[60px] px-6 rounded-xl text-white text-[15px] font-medium transition-colors
                  ${totalCalc ? 'bg-red-600 hover:bg-red-700 shadow-sm' : 'bg-slate-300 cursor-not-allowed'}`}>
                  {isDone ? 'Đơn xong ✓' : 'Thanh toán'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
