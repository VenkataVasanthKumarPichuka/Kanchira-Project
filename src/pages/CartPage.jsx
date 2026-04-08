import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCart, addToCart, getCouponByCode, getFestival, createPayment } from '../services/api'
import toast from 'react-hot-toast'
import AddressModal from '../components/AddressModal'
import CouponModal from '../components/CouponModal'

export default function CartPage() {
  const navigate = useNavigate()
  const { user, cartItems, setCartItems, setLoginModalOpen, loadCart } = useApp()
  const [address, setAddress] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponType, setCouponType] = useState('')
  const [festivalDiscounts, setFestivalDiscounts] = useState([])
  const [applyFestival, setApplyFestival] = useState(null)
  const [spinDiscount, setSpinDiscount] = useState(0)
  const [isPlacing, setIsPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)

  // ─── Load cart, discounts, festival ────────────────────────────────
  useEffect(() => {
    if (!user) { setLoginModalOpen(true); return }
    loadCart()

    const prize = localStorage.getItem('discountPrize')
    const expiry = localStorage.getItem('discountTime')
    if (prize && expiry && Date.now() < +expiry) {
      const m = prize.match(/(\d+)%/)
      if (m) setSpinDiscount(Math.min(parseFloat(m[1]), 25))
    }

    getFestival().then(r => {
      const f = r.data?.festivals || r.data || []
      const active = f.filter(d => d.active)
      setFestivalDiscounts(active)
      if (active.length > 0) setApplyFestival(active[0])
    }).catch(() => {})
  }, [user])

  // ─── Update quantity ────────────────────────────────
  const updateQty = (index, delta) => {
    setCartItems(prev => {
      const updated = [...prev]
      const newQty = (updated[index].quantity || 1) + delta
      if (newQty < 1) return prev
      updated[index] = { ...updated[index], quantity: newQty }
      return updated
    })
  }

  // ─── Remove item ────────────────────────────────
  const removeItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
    toast.success('Item removed')
  }

  // ─── Subtotal & discounts ────────────────────────────────
  const subtotal = cartItems.reduce((s, item) => {
    const price = parseFloat(item.variant?.price || 0)
    return s + price * (item.quantity || 1)
  }, 0)

  const festivalDiscountAmt = applyFestival
    ? applyFestival.type === 'percentage'
      ? (subtotal * applyFestival.value) / 100
      : applyFestival.value
    : 0

  const afterFestival = subtotal - festivalDiscountAmt
  const couponDiscountAmt = couponApplied
    ? couponType === 'percentage' ? (afterFestival * couponDiscount) / 100 : couponDiscount
    : 0
  const afterCoupon = afterFestival - couponDiscountAmt
  const spinDiscountAmt = spinDiscount > 0 ? (afterCoupon * spinDiscount) / 100 : 0
  const totalPrice = Math.max(0, afterCoupon - spinDiscountAmt)
  const deliveryCharge = totalPrice > 499 ? 0 : 49

  // ─── Apply coupon ────────────────────────────────
  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const r = await getCouponByCode(couponCode.trim())
      const c = r.data?.coupon || r.data
      if (c && new Date(c.expiryDate) >= new Date()) {
        setCouponApplied(true)
        setCouponType(c.type)
        setCouponDiscount(c.value)
        toast.success(`Coupon applied! ${c.type === 'percentage' ? c.value + '%' : '₹' + c.value} off`)
      } else {
        toast.error('Invalid or expired coupon')
      }
    } catch { toast.error('Coupon not found') }
  }

  // ─── Place order ────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!address) { toast.error('Please add a delivery address'); setShowAddressModal(true); return }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return }
    setIsPlacing(true)
    try {
      if (paymentMethod === 'ONLINE') {
        const r = await createPayment(Math.round(totalPrice + deliveryCharge))
        const url = r.data?.redirectUrl || r.data?.paymentUrl
        if (url) { window.location.href = url; return }
      }
      toast.success('Order placed successfully! 🎉')
      setCartItems([])
      localStorage.removeItem('discountPrize')
      localStorage.removeItem('discountTime')
      navigate('/')
    } catch { toast.error('Failed to place order') }
    setIsPlacing(false)
  }

  // ─── Add to cart handler (triggered by a button, not at top level!) ─────────
  const handleAddToCart = async (product, selectedVariant, selectedSize) => {
    if (!user) { setLoginModalOpen(true); return }
    if (!selectedSize) { toast.error('Please select a size'); return }

    try {
      await addToCart({
        userId: user._id,
        items: [{
          productId: product._id,
          image: selectedVariant?.images?.[0]?.url || product.image,
          variant: {
            color: selectedVariant?.color,
            size: selectedSize.size,
            price: selectedSize.finalPrice
          },
          quantity: 1
        }]
      })
      await loadCart()
      toast.success('Added to cart!')
    } catch (err) {
      console.error('Cart Error:', err?.response?.data || err.message)
      toast.error('Failed to add to cart')
    }
  }

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <i className="fa fa-lock text-5xl text-gray-300" />
      <p className="text-gray-500">Please login to view your cart</p>
      <button className="btn-maroon w-40" onClick={() => setLoginModalOpen(true)}>Login</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* ... rest of your JSX remains unchanged ... */}
    </div>
  )
}