import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

export function PaymentCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const code = searchParams.get('code') || searchParams.get('status')
    if (code === 'PAYMENT_SUCCESS' || code === 'success') {
      setStatus('success')
      toast.success('Payment successful! 🎉')
    } else if (code === 'PAYMENT_FAILED' || code === 'failed') {
      setStatus('failed')
      toast.error('Payment failed')
    } else {
      setStatus('success') // default
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-sm w-full">
        {status === 'success' ? (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mb-6">Your order has been placed successfully.</p>
          </>
        ) : status === 'failed' ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-6">Something went wrong. Please try again.</p>
          </>
        ) : (
          <>
            <div className="spinner-loader mx-auto mb-4" />
            <p className="text-gray-500">Processing payment...</p>
          </>
        )}
        <button className="btn-maroon" onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    </div>
  )
}

export function BuynowPage() {
  const navigate = useNavigate()
  const [address, setAddress] = useState({ name:'', phone:'', street:'', city:'', state:'', pincode:'' })
  const data = JSON.parse(localStorage.getItem('buynow_product') || '{}')
  const { product, selectedVariant, selectedSize } = data

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">No product selected. <button className="text-[#800000] hover:underline" onClick={() => navigate('/')}>Go Home</button></p>
    </div>
  )

  const handleOrder = () => {
    if (!address.name || !address.street || !address.city || !address.pincode) {
      toast.error('Please fill in delivery address')
      return
    }
    toast.success('Order placed! 🎉')
    localStorage.removeItem('buynow_product')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <button className="text-[#800000] text-sm mb-4 flex items-center gap-1" onClick={() => navigate(-1)}>
          <i className="fa fa-arrow-left" /> Back
        </button>
        <h1 className="text-xl font-bold mb-6">Buy Now</h1>

        {/* Product summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 mb-4">
          <img src={selectedVariant?.images?.[0]?.url || product.image} alt={product.name}
            className="w-24 h-28 object-cover rounded-lg" onError={e => { e.target.src='https://via.placeholder.com/96' }} />
          <div>
            <p className="font-semibold capitalize">{product.name}</p>
            {selectedVariant?.color && <p className="text-xs text-gray-500 mt-1">Color: {selectedVariant.color}</p>}
            {selectedSize?.size && <p className="text-xs text-gray-500">Size: {selectedSize.size}</p>}
            {selectedSize?.finalPrice && <p className="text-lg font-bold text-[#800000] mt-1">₹{selectedSize.finalPrice}</p>}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold mb-3">Delivery Address</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k:'name', ph:'Full Name' }, { k:'phone', ph:'Phone' },
              { k:'street', ph:'Street / Area', full:true },
              { k:'city', ph:'City' }, { k:'state', ph:'State' }, { k:'pincode', ph:'Pincode' }
            ].map(f => (
              <input key={f.k}
                className={`form-input ${f.full ? 'col-span-2' : ''}`}
                placeholder={f.ph}
                value={address[f.k]}
                onChange={e => setAddress({ ...address, [f.k]: e.target.value })} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>₹{selectedSize?.finalPrice || 0}</span>
        </div>

        <button className="btn-maroon text-base py-4" onClick={handleOrder}>
          💰 Place Order (COD)
        </button>
      </div>
    </div>
  )
}
