import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const PRIZES = ['5% OFF','10% OFF','15% OFF','20% OFF','Try Again','25% OFF','Free Ship','30% OFF']
const COLORS = ['#800000','#a33333','#cc6666','#e69999','#800000','#a33333','#cc6666','#e69999']

export default function DiscountSpinPage() {
  const navigate = useNavigate()
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [deg, setDeg] = useState(0)

  const spin = () => {
    if (spinning) return
    setSpinning(true); setResult(null)
    const winIdx = Math.floor(Math.random() * PRIZES.length)
    const target = 360 * 5 + (360 / PRIZES.length) * (PRIZES.length - winIdx) - (360 / PRIZES.length / 2)
    const newDeg = deg + target
    const wheel = document.getElementById('spin-wheel-main')
    if (wheel) {
      wheel.style.transition = 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)'
      wheel.style.transform = `rotate(${newDeg}deg)`
    }
    setTimeout(() => {
      const prize = PRIZES[winIdx]
      setResult(prize); setDeg(newDeg % 360); setSpinning(false)
      if (prize !== 'Try Again') {
        localStorage.setItem('discountPrize', prize)
        localStorage.setItem('discountTime', String(Date.now() + 86400000))
        setTimeout(() => navigate('/cartcomponent'), 2500)
      }
    }, 4200)
  }

  const size = 300, cx = size/2, cy = size/2, r = size/2 - 6
  const seg = PRIZES.length
  const angle = (2 * Math.PI) / seg

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 py-10 px-4">
      <h1 className="text-3xl font-bold text-[#800000]">🎰 Spin & Win!</h1>
      <p className="text-gray-500 text-sm text-center max-w-xs">Spin the wheel once to win a special discount on your order!</p>

      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10 text-3xl text-[#800000]">▼</div>
        <svg id="spin-wheel-main" width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ transformOrigin: 'center', transition: 'none' }}>
          {PRIZES.map((prize, i) => {
            const s = i * angle, e = (i + 1) * angle
            const x1 = cx + r*Math.cos(s), y1 = cy + r*Math.sin(s)
            const x2 = cx + r*Math.cos(e), y2 = cy + r*Math.sin(e)
            const mid = s + angle/2
            const tx = cx + r*0.65*Math.cos(mid), ty = cy + r*0.65*Math.sin(mid)
            return (
              <g key={i}>
                <path d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                  fill={COLORS[i%COLORS.length]} stroke="#fff" strokeWidth={2}/>
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={11} fontWeight="bold"
                  transform={`rotate(${mid*180/Math.PI+90},${tx},${ty})`}>{prize}</text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={20} fill="#fff" stroke="#800000" strokeWidth={3}/>
        </svg>
      </div>

      {result && (
        <div className={`py-3 px-8 rounded-2xl text-lg font-bold text-center ${result==='Try Again' ? 'bg-gray-100 text-gray-500' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {result==='Try Again' ? '😔 Better luck next time!' : `🎉 You won ${result}!`}
          {result!=='Try Again' && <p className="text-sm font-normal mt-1">Redirecting to cart...</p>}
        </div>
      )}

      <button
        onClick={spin} disabled={spinning}
        className="bg-[#800000] text-white px-12 py-4 rounded-full text-lg font-bold disabled:opacity-50 hover:opacity-90 shadow-lg">
        {spinning ? 'Spinning...' : '🎰 SPIN NOW!'}
      </button>

      <button className="text-sm text-gray-400 hover:text-gray-600" onClick={() => navigate(-1)}>Skip</button>
    </div>
  )
}
