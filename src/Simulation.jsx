import { useState, useEffect, useRef } from 'react'
import { Sparkles, Camera, Keyboard, SquarePen, Check, AudioLines } from 'lucide-react'

// ─── CSS audio bars animation (thay Lottie) ───────────────────
const barStyle = (delay) => ({
  width: 4,
  borderRadius: 2,
  background: 'white',
  animation: `audioBar 0.8s ease-in-out ${delay}s infinite alternate`,
})

function AudioBars() {
  return (
    <>
      <style>{`
        @keyframes audioBar {
          from { height: 8px; }
          to   { height: 28px; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 36 }}>
        {[0, 0.15, 0.3, 0.15, 0].map((d, i) => (
          <div key={i} style={barStyle(d)} />
        ))}
      </div>
    </>
  )
}

// ─── Data ─────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: 'Mi Kokomi tom chua cay', price: 5000,  qty: 2, unit: 'goi', emoji: '🍜' },
  { id: 2, name: 'Coca Cola vi nguyen ban', price: 10000, qty: 2, unit: 'lon', emoji: '🥤' },
  { id: 3, name: 'Trung ga ta',             price: null,  qty: 2, unit: 'trai', emoji: '🥚' },
]

const STEPS = [
  { dur: 2000,  mode: 'dashboard', ai: 'idle',    msgs: [],                                                                                                       items: [],      prices: {},       total: null, phone: null, name: null },
  { dur: 4000,  mode: 'dashboard', ai: 'listen',  msgs: [{ r:'customer', s:'Nhi', t:'Di Thu oi, cho con may cai nay voi 2 trai trung ga ta' }],                   items: [],      prices: {},       total: null, phone: null, name: null },
  { dur: 2000,  mode: 'dashboard', ai: 'listen',  msgs: [{ r:'customer', s:'Nhi', t:'Di Thu oi, cho con may cai nay voi 2 trai trung ga ta' }, { r:'store', s:'Di Thu', t:'Ok. Trung ne con.' }], items: [], prices: {}, total: null, phone: null, name: null },
  { dur: 3000,  mode: 'camera',    ai: 'listen',  msgs: [{ r:'store', s:'Di Thu', t:'Ok. Trung ne con.' }],                                                        items: [],      prices: {},       total: null, phone: null, name: null },
  { dur: 1500,  mode: 'review',    ai: 'active',  msgs: [{ r:'store', s:'Di Thu', t:'Ok. Trung ne con.' }],                                                        items: [],      prices: {},       total: null, phone: null, name: null },
  { dur: 1500,  mode: 'cart',      ai: 'active',  msgs: [{ r:'ai', t:'Tao don cho Nhi con ba Nam' }],                                                              items: [1,2,3], prices: {},       total: null, phone: null, name: null },
  { dur: 2000,  mode: 'cart',      ai: 'active',  msgs: [{ r:'ai', t:'Tao don cho Nhi con ba Nam' }, { r:'ai', t:'Chua co gia trung ga ta', warn: true }],         items: [1,2,3], prices: {},       total: null, phone: null, name: null },
  { dur: 2000,  mode: 'cart',      ai: 'listen',  msgs: [{ r:'ai', t:'Chua co gia trung ga ta', warn: true }, { r:'store', s:'Di Thu', t:'4k mot trai nhen.' }],   items: [1,2,3], prices: {},       total: null, phone: null, name: null },
  { dur: 800,   mode: 'cart',      ai: 'active',  msgs: [{ r:'store', s:'Di Thu', t:'4k mot trai nhen.' }],                                                        items: [1,2,3], prices: { 3: 4000 }, total: null, phone: null, name: null },
  { dur: 1500,  mode: 'cart',      ai: 'active',  msgs: [{ r:'ai', t:'Tong don 38.000d' }],                                                                        items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: null, name: null },
  { dur: 1500,  mode: 'cart',      ai: 'active',  msgs: [{ r:'ai', t:'Tong don 38.000d' }, { r:'ai', t:'Xin so dien thoai khach de tich diem' }],                  items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: null, name: null },
  { dur: 3000,  mode: 'cart',      ai: 'listen',  msgs: [{ r:'store', s:'Di Thu', t:'Mua Mi Do tich diem do, may tich khong con?' }],                              items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: null, name: null },
  { dur: 2000,  mode: 'cart',      ai: 'listen',  msgs: [{ r:'store', s:'Di Thu', t:'Mua Mi Do tich diem do, may tich khong con?' }, { r:'customer', s:'Nhi', t:'Da co, tich diem sao di' }], items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: null, name: null },
  { dur: 2000,  mode: 'cart',      ai: 'listen',  msgs: [{ r:'store', s:'Di Thu', t:'May doc di so dien thoai' }],                                                 items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: null, name: null },
  { dur: 3000,  mode: 'cart',      ai: 'listen',  msgs: [{ r:'store', s:'Di Thu', t:'May doc di so dien thoai' }, { r:'customer', s:'Nhi', t:'Da so con la 0986577626' }], items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: null, name: null },
  { dur: 800,   mode: 'cart',      ai: 'active',  msgs: [{ r:'customer', s:'Nhi', t:'Da so con la 0986577626' }],                                                  items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: '0986577626', name: null },
  { dur: 4000,  mode: 'cart',      ai: 'listen',  msgs: [{ r:'customer', s:'Nhi', t:'Di cho con mua thieu nha, ma con len Sai Gon roi' }],                         items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: '0986577626', name: null },
  { dur: 3000,  mode: 'cart',      ai: 'listen',  msgs: [{ r:'store', s:'Di Thu', t:'Ok. Nhi con ba Nam thieu 38k nhen' }],                                        items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: '0986577626', name: null },
  { dur: 1000,  mode: 'cart',      ai: 'active',  msgs: [{ r:'store', s:'Di Thu', t:'Ok. Nhi con ba Nam thieu 38k nhen' }],                                        items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: '0986577626', name: 'Nhi con ba Nam' },
  { dur: 1500,  mode: 'cart',      ai: 'active',  msgs: [{ r:'ai', t:'Ghi so no hoan tat!', ok: true }],                                                           items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: '0986577626', name: 'Nhi con ba Nam' },
  { dur: 4000,  mode: 'done',      ai: 'idle',    msgs: [{ r:'ai', t:'Ghi so no hoan tat!', ok: true }],                                                           items: [1,2,3], prices: { 3: 4000 }, total: 38000, phone: '0986577626', name: 'Nhi con ba Nam' },
  { dur: 3000,  mode: 'dashboard_end', ai: 'idle', msgs: [],                                                                                                       items: [],      prices: {},       total: null, phone: null, name: null },
]

export default function Simulation() {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef(null)
  const step = STEPS[idx] || STEPS[0]

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIdx(i => (i + 1 >= STEPS.length ? 0 : i + 1))
    }, step.dur)
    return () => clearTimeout(timerRef.current)
  }, [idx, step.dur])

  const isListen = step.ai === 'listen'
  const isActive = step.ai === 'active'
  const isCamera = step.mode === 'camera'
  const isReview = step.mode === 'review'
  const isDash   = step.mode === 'dashboard' || step.mode === 'dashboard_end'
  const isCart   = step.mode === 'cart' || step.mode === 'done'
  const isDone   = step.mode === 'done'
  const isAnimated = isListen || isActive

  const cartTotal = step.total ?? (
    step.items.length > 0
      ? step.items.reduce((s, id) => {
          const p = PRODUCTS.find(x => x.id === id)
          const pr = step.prices[id] ?? p.price
          return s + (pr ? pr * p.qty : 0)
        }, 0)
      : null
  )

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* Topbar */}
      <div className="flex items-center gap-4 px-6 py-6 bg-[#f8fafc] shrink-0">
        <div className="flex items-center h-[60px] w-[448px] bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden shrink-0">
          <div className="flex items-center pl-4 pr-2">
            <svg width="22" height="22" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span className="text-slate-400 text-[15px] flex-1 px-2">Nhap ten san pham hoac ma SKU</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-medium text-slate-900 px-4 py-3">Tap hoa di Thu</span>
          <div className="w-px h-7 bg-slate-300" />
          <div className="w-[60px] h-[60px] rounded-xl bg-slate-50" />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 grid grid-cols-[2fr_1fr] gap-6 px-6 pb-6 min-h-0">

        {/* Left: AI Chat */}
        <div className="relative bg-white rounded-3xl flex flex-col min-h-0 overflow-hidden">
          <div className="absolute pointer-events-none rounded-full" style={{
            width: 1300, height: 592, top: '50%', left: '50%',
            transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
            background: 'linear-gradient(-88deg,rgba(253,230,138,0.15) 0%,rgba(253,186,116,0.15) 51%,rgba(251,113,133,0.15) 100%)',
            filter: 'blur(150px)', zIndex: 0,
          }} />

          {(isCamera || isReview) && (
            <div className="absolute inset-0 z-30 bg-black/90 rounded-3xl flex flex-col items-center justify-center gap-4">
              <div className="w-72 h-72 rounded-2xl bg-zinc-800 flex items-center justify-center text-7xl">
                {isCamera ? '📷' : '🛒'}
              </div>
              <p className="text-white/70 text-[15px]">
                {isCamera ? 'Dang chup anh san pham...' : 'AI dang nhan dien...'}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="relative z-20 flex items-center pl-6 pr-5 py-[18px] bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-amber-500" strokeWidth={1.8} />
              <span className="text-[17px] font-medium text-slate-900">Tro ly Win</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isListen ? 'bg-red-500 animate-pulse' : isActive ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-[13px] text-slate-400">
                {isListen ? 'Dang nghe...' : isActive ? 'Dang xu ly...' : 'San sang'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="relative z-10 flex-1 overflow-y-auto px-8 py-4 flex flex-col justify-end min-h-0">
            {step.msgs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center pb-8">
                <p className="text-[18px] font-semibold text-slate-700 text-center">Ban cu noi va tro ly Win se lam theo</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {step.msgs.map((msg, i) => (
                  <div key={i} className={`flex ${msg.r === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    {msg.r === 'ai' ? (
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <Sparkles size={14} className="text-amber-400 mt-1 shrink-0" strokeWidth={1.8} />
                        <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 text-[15px]
                          ${msg.warn ? 'bg-orange-50 border border-orange-200 text-orange-700' :
                            msg.ok  ? 'bg-green-50 border border-green-200 text-green-700' :
                            'bg-slate-100 text-slate-800'}`}>
                          {msg.t}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1 max-w-[80%]">
                        <span className="text-[11px] text-slate-400">{msg.s}</span>
                        <div className={`rounded-2xl rounded-tr-sm px-4 py-2.5 text-[15px]
                          ${msg.r === 'store' ? 'bg-blue-50 border border-blue-100 text-slate-700' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
                          {msg.t}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="relative z-20 flex items-center justify-center pb-8 pt-3 bg-white shrink-0">
            <div className="flex items-center border border-slate-200 bg-white rounded-2xl shadow-sm">
              <button className="flex items-center gap-3 h-[60px] px-6 rounded-l-2xl text-slate-900">
                <Camera size={20} strokeWidth={1.8} />
                <span className="text-[15px] font-medium">Chup tao don</span>
              </button>
              <div className="w-px h-6 bg-slate-200" />
              {/* Mic / AudioBars button */}
              <div className="flex items-center justify-center px-4" style={{ height: 84 }}>
                <div
                  className="flex items-center justify-center rounded-full bg-red-600"
                  style={{
                    width: 84, height: 84,
                    boxShadow: isAnimated ? '0 0 0 10px rgba(220,38,38,0.15)' : '0 2px 8px rgba(220,38,38,0.3)',
                  }}
                >
                  {isAnimated ? <AudioBars /> : <AudioLines size={36} strokeWidth={1.8} className="text-white" />}
                </div>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <button className="flex items-center gap-3 h-[60px] px-6 rounded-r-2xl text-slate-900">
                <Keyboard size={20} strokeWidth={1.8} />
                <span className="text-[15px] font-medium">Nhap tin nhan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col bg-white rounded-3xl overflow-hidden min-h-0">
          {isDash && (
            <>
              <div className="pl-6 pr-5 py-[18px] border-b border-slate-100 shrink-0">
                <p className="text-[16px] font-semibold text-slate-900">Tong quan hom nay</p>
              </div>
              <div className="flex-1 px-6 py-6 flex flex-col gap-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5">
                  <p className="text-[13px] text-slate-500 mb-1">Doanh thu hom nay</p>
                  <p className="text-[28px] font-bold text-slate-900">
                    {step.mode === 'dashboard_end' ? '694.000' : '656.000'}d
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Da ban {step.mode === 'dashboard_end' ? '10' : '9'} don
                  </p>
                </div>
                {step.mode === 'dashboard_end' && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <Check size={16} className="text-green-600" />
                    <p className="text-[14px] text-green-700 font-medium">Ghi don hoan tat!</p>
                  </div>
                )}
              </div>
            </>
          )}

          {isCart && (
            <>
              <div className="flex items-center gap-3 pl-6 pr-5 py-[18px] border-b border-slate-100 shrink-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-semibold text-slate-900 truncate">{step.name || 'Don hang moi'}</p>
                  {step.phone && <p className="text-[13px] text-slate-400">{step.phone}</p>}
                </div>
                <SquarePen size={16} className="text-slate-400 shrink-0" strokeWidth={1.8} />
              </div>

              <div className="flex-1 overflow-y-auto px-6 min-h-0">
                <div className="py-2">
                  {PRODUCTS.map(p => {
                    const pr = step.prices[p.id] ?? p.price
                    return (
                      <div key={p.id} className={`py-3 border-b border-slate-50 last:border-0 ${step.items.includes(p.id) ? '' : 'hidden'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl shrink-0">{p.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-slate-800 truncate">{p.name}</p>
                            <p className="text-[12px] text-slate-400">{p.qty} {p.unit}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {pr ? (
                              <p className="text-[13px] font-medium text-slate-800">{(pr * p.qty).toLocaleString('vi-VN')}d</p>
                            ) : (
                              <p className="text-[11px] text-orange-400 font-medium">Chua co gia</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {isDone && (
                  <div className="flex flex-col gap-3 py-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                      <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] font-semibold text-green-800">Da ghi so no</p>
                        <p className="text-[12px] text-green-700">{step.name} — 38.000d</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                      <Check size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] font-semibold text-blue-800">Da gui SMS tich diem</p>
                        <p className="text-[12px] text-blue-700">-{step.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pl-6 pr-5 py-[18px] border-t border-slate-100 bg-white shrink-0">
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-[14px] text-slate-600">Tong tien:</span>
                  <span className={`text-[14px] font-bold ${cartTotal ? 'text-red-600' : 'text-slate-400'}`}>
                    {cartTotal ? cartTotal.toLocaleString('vi-VN') + 'd' : '--'}
                  </span>
                </div>
                <button className={`h-[52px] px-5 rounded-xl text-white text-[14px] font-medium ${cartTotal ? 'bg-red-600' : 'bg-slate-300'}`}>
                  {isDone ? 'Xong' : 'Thanh toan'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
