import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const PRIZES = ['5% OFF', '10% OFF', '15% OFF', '20% OFF', 'Try Again', '25% OFF', 'Free Ship', '30% OFF']
const COLORS = ['#800000','#a33333','#cc6666','#e69999','#800000','#a33333','#cc6666','#e69999']

export function DiscountSpin({ mini }) {
  const navigate = useNavigate()

  if (mini) return (
    <button
      className="bg-[#800000] text-white text-xs px-3 py-1.5 rounded-full shadow-lg hover:opacity-90 font-semibold"
      onClick={() => navigate('/spinner')}>
      🎰 Spin & Win!
    </button>
  )

  return <DiscountSpinFull />
}

function DiscountSpinFull() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [rotation, setRotation] = useState(0)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)

    const winIndex = Math.floor(Math.random() * PRIZES.length)
    const targetAngle = 360 * 5 + (360 / PRIZES.length) * (PRIZES.length - winIndex) - 360 / PRIZES.length / 2
    const newRotation = rotation + targetAngle

    // Animate via CSS
    const wheel = document.getElementById('spin-wheel')
    if (wheel) {
      wheel.style.transition = 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)'
      wheel.style.transform = `rotate(${newRotation}deg)`
    }

    setTimeout(() => {
      const prize = PRIZES[winIndex]
      setResult(prize)
      setRotation(newRotation % 360)
      setSpinning(false)

      if (prize !== 'Try Again') {
        localStorage.setItem('discountPrize', prize)
        localStorage.setItem('discountTime', String(Date.now() + 24 * 60 * 60 * 1000))
        setTimeout(() => navigate('/cartcomponent'), 2000)
      }
    }, 4200)
  }

  const size = 280
  const segments = PRIZES.length
  const anglePerSeg = (2 * Math.PI) / segments

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <h2 className="text-2xl font-bold text-[#800000]">Spin & Win!</h2>
      <p className="text-gray-500 text-sm">Spin the wheel to get a discount on your next order</p>

      <div className="relative" style={{ width: size, height: size }}>
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-2xl">▼</div>

        <svg
          id="spin-wheel"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transition: 'none', transformOrigin: 'center' }}>
          {PRIZES.map((prize, i) => {
            const startAngle = i * anglePerSeg
            const endAngle = (i + 1) * anglePerSeg
            const cx = size / 2, cy = size / 2, r = size / 2 - 4
            const x1 = cx + r * Math.cos(startAngle)
            const y1 = cy + r * Math.sin(startAngle)
            const x2 = cx + r * Math.cos(endAngle)
            const y2 = cy + r * Math.sin(endAngle)
            const midAngle = startAngle + anglePerSeg / 2
            const tx = cx + (r * 0.65) * Math.cos(midAngle)
            const ty = cy + (r * 0.65) * Math.sin(midAngle)
            return (
              <g key={i}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                  fill={COLORS[i % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <text
                  x={tx} y={ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={11}
                  fontWeight="bold"
                  transform={`rotate(${(midAngle * 180) / Math.PI + 90}, ${tx}, ${ty})`}>
                  {prize}
                </text>
              </g>
            )
          })}
          <circle cx={size/2} cy={size/2} r={18} fill="#fff" stroke="#800000" strokeWidth={3} />
        </svg>
      </div>

      {result && (
        <div className={`text-center py-3 px-6 rounded-xl font-bold text-lg ${result === 'Try Again' ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {result === 'Try Again' ? '😔 Better luck next time!' : `🎉 You won: ${result}!`}
        </div>
      )}

      <button
        className="bg-[#800000] text-white px-10 py-3 rounded-full text-base font-bold disabled:opacity-50 hover:opacity-90"
        onClick={spin}
        disabled={spinning}>
        {spinning ? 'Spinning...' : '🎰 SPIN!'}
      </button>
    </div>
  )
}

export default DiscountSpin
