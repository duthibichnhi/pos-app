import {
  Search,
  Store,
  ChevronDown,
  CircleUserRound,
  Sparkles,
  Mic,
  Camera,
  Keyboard,
} from 'lucide-react'
export default function App() {
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* Topbar */}
      <div className="flex items-center gap-4 px-6 py-6 bg-[#f8fafc] shrink-0">
        {/* Search */}
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors">
            <Store size={22} strokeWidth={1.8} className="text-slate-700" />
            <span className="text-[15px] font-medium text-slate-900 whitespace-nowrap">
              Tạp hóa dì Thư
            </span>
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
          {/* Gradient blur backdrop */}
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: '1300px',
              height: '592px',
              top: '50%',
              left: '50%',
              transform: 'translate(calc(-50% + 6px), calc(-50% + 12px))',
              background:
                'linear-gradient(-88deg, rgba(253,230,138,0.2) 0%, rgba(253,186,116,0.2) 51%, rgba(251,113,133,0.2) 100%)',
              filter: 'blur(150px)',
              zIndex: 0,
            }}
          />

          {/* AI Head */}
          <div className="relative z-10 flex items-center px-6 py-[18px] bg-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={26} strokeWidth={1.8} className="text-amber-500" />
              <span className="text-[17px] font-medium text-slate-900">Trợ lý Win</span>
            </div>
          </div>

          {/* AI Chat */}
          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 flex flex-col items-center justify-center px-12 py-20 overflow-auto">
              <div className="flex flex-col items-center gap-5 w-full">
                {/* Record button */}
                <button
                  className="flex items-center justify-center w-[120px] h-[120px] rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all"
                  style={{
                    boxShadow: '0 4px 6px rgba(26,26,26,0.05), 0 8px 10px rgba(26,26,26,0.05)',
                  }}
                >
                  <Mic size={52} strokeWidth={1.8} className="text-white" />
                </button>

                <p className="text-[19px] font-semibold text-slate-900 text-center">
                  Dì Thư nói &ldquo;Win ơi&rdquo; để bắt đầu nha
                </p>

                {/* Guide cards */}
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
