import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// import { getProducts, addToCart, addWishlist, getReview, getPincodes, createPayment } from '../services/api'
import { getProducts, addToCart, getReview, getPincodes,} from '../services/api'

import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'
import ReviewDialog from '../components/ReviewDialog'
import ImagePopup from '../components/ImagePopup'
import FilterSidebar from '../components/auth/FilterSidebar'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loadCart, setLoginModalOpen, addToWishlistLocal, isInWishlist } = useApp()

  const [product, setProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [popupImg, setPopupImg] = useState(null)
  const [zipcodes, setZipcodes] = useState([])
  const [selectedZip, setSelectedZip] = useState('')
  const [zipMsg, setZipMsg] = useState('')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [addingCart, setAddingCart] = useState(false)

  useEffect(() => {
    if (!id) return
    // Fetch all products and find by id
    getProducts()
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : r.data?.products || []
        const found = all.find(p => p._id === id)
        if (found) {
          setProduct(found)
          setSelectedVariant(found.variants?.[0] || null)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))

    getReview(id)
      .then(r => setReviews(r.data?.reviews || r.data || []))
      .catch(() => {})

    getPincodes()
      .then(r => setZipcodes(r.data?.pincodes || r.data || []))
      .catch(() => {})
  }, [id])

  const onColorSelect = (variant) => {
    setSelectedVariant(variant)
    setSelectedSize(null)
  }

  const onSizeSelect = (size) => setSelectedSize(size)


const handleAddToCart = async () => {
  if (!user) { setLoginModalOpen(true); return }

  if (!selectedSize?.size || !selectedSize?.finalPrice) {
    toast.error("Please select a valid size")
    return
  }

  setAddingCart(true)
  try {
    await addToCart({
      userId: user._id || user.id,
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
    console.error("Cart Error:", err?.response?.data || err.message)
    toast.error('Failed to add to cart')
  } finally {
    setAddingCart(false)
  }
}

  const handleBuyNow = async () => {
    if (!user) { setLoginModalOpen(true); return }
    if (!selectedSize) { toast.error('Please select a size'); return }
    localStorage.setItem('buynow_product', JSON.stringify({ product, selectedVariant, selectedSize }))
    navigate('/buynow')
  }

  const handleWishlist = async () => {
    if (!user) { setLoginModalOpen(true); return }
    try {
      // await addWishlist({ userId: user._id || user.id, productId: product._id })
      addToWishlistLocal(product)
      toast.success(isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist!')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const checkZipcode = () => {
    if (!selectedZip) return
    const valid = zipcodes.includes(selectedZip) || zipcodes.some(z => z === selectedZip || z.pincode === selectedZip)
    setZipMsg(valid ? '✅ Delivery available for this pincode!' : '❌ Delivery not available for this pincode.')
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null

  if (loading) return <div className="flex justify-center py-20"><div className="spinner-loader" /></div>
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="flex gap-2 items-center px-4 py-3 text-xs text-gray-500 flex-wrap">
        <span className="cursor-pointer hover:text-[#800000]" onClick={() => navigate('/')}>Home</span>
        <span>›</span>
        {product.categoryId?.name && <><span className="capitalize">{product.categoryId.name}</span><span>›</span></>}
        {product.subcategoryId?.name && <><span className="capitalize">{product.subcategoryId.name}</span><span>›</span></>}
        {product.subsubcategoryId?.name && (
          <span className="cursor-pointer capitalize hover:text-[#800000]"
            onClick={() => navigate(-1)}>{product.subsubcategoryId.name}</span>
        )}
        <span>›</span>
        <strong className="text-gray-800">{product.name}</strong>
      </div>

      <div className="flex flex-wrap gap-8 px-4 pb-12">
        {/* ── Gallery ── */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex flex-wrap gap-3">
            {selectedVariant?.images?.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img.url}
                  alt={img.alt || product.name}
                  className="w-32 h-40 md:w-44 md:h-56 object-cover rounded-xl border border-gray-200 cursor-pointer hover:border-[#800000] transition-all"
                  onClick={() => setPopupImg(img.url)}
                  onError={e => { e.target.src = 'https://via.placeholder.com/200' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Info Panel ── */}
        <div className="flex-1 min-w-[280px] max-w-lg">
          <h1 className="text-xl font-semibold capitalize mb-1">{product.name}</h1>
          <p className="text-gray-400 text-sm mb-3">{product.metaTitle}</p>

          {/* Rating badge */}
          {selectedVariant?.rating && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-[#800000] px-3 py-1 rounded-full text-sm font-medium mb-3">
              {selectedVariant.rating} <i className="fa fa-star text-yellow-400" />
            </span>
          )}

          {/* Selected size price */}
          {selectedSize && (
            <div className="mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl font-bold text-gray-900">₹{selectedSize.finalPrice}</span>
                {selectedSize.discountPercentage > 0 && (
                  <>
                    <span className="text-base text-maroon line-through text-[#800000]">₹{selectedSize.price}</span>
                    <span className="bg-[#800000] text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedSize.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">Selected: {selectedSize.size}</p>
            </div>
          )}
          {!selectedSize && product.variants?.[0]?.sizes?.[0] && (
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl font-bold">₹{product.variants[0].sizes[0].finalPrice}</span>
              {product.variants[0].sizes[0].discountPercentage > 0 && (
                <span className="text-base text-gray-400 line-through">₹{product.variants[0].sizes[0].price}</span>
              )}
            </div>
          )}

          {/* Sizes */}
          {selectedVariant?.sizes?.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#800000]">Available Sizes</label>
                <span className="text-xs text-gray-500 cursor-pointer hover:text-[#800000]">Size Chart</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedVariant.sizes.map(sz => (
                  <button
                    key={sz.size}
                    onClick={() => onSizeSelect(sz)}
                    className={`size-option ${selectedSize?.size === sz.size ? 'selected' : ''} ${!sz.isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={!sz.isAvailable}>
                    {sz.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.variants?.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-semibold block mb-2">Color</label>
              <div className="flex gap-3">
                {product.variants.map(v => (
                  <button
                    key={v.color}
                    title={v.color}
                    onClick={() => onColorSelect(v)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${selectedVariant?.color === v.color ? 'border-[#800000] scale-110' : 'border-gray-300'}`}
                    style={{ backgroundColor: v.colorCode }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={addingCart}
              className="flex-1 bg-[#800000] text-white py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {addingCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button onClick={handleBuyNow} disabled={!selectedSize}
              className="flex-1 border-2 border-[#800000] text-[#800000] py-3 rounded-lg text-sm font-semibold hover:bg-[#800000] hover:text-white transition-all disabled:opacity-50">
              Buy Now
            </button>
            <button onClick={handleWishlist}
              className={`px-4 py-3 rounded-lg text-sm border transition-all ${isInWishlist(product._id) ? 'bg-red-50 border-red-400 text-red-600' : 'border-gray-300 hover:border-[#800000] hover:text-[#800000]'}`}>
              {isInWishlist(product._id) ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>

          {/* Delivery Info */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-2">100% Original Products</p>
            <div className="flex gap-2 mb-3">
              <select
                value={selectedZip}
                onChange={e => setSelectedZip(e.target.value)}
                className="form-input flex-1 text-sm">
                <option value="">Select Pincode</option>
                {zipcodes.map((z, i) => (
                  <option key={i} value={z?.pincode || z}>{z?.pincode || z}</option>
                ))}
              </select>
              <button onClick={checkZipcode}
                className="px-4 py-2 bg-[#800000] text-white rounded-lg text-sm">Check</button>
            </div>
            {zipMsg && <p className="text-xs mb-2">{zipMsg}</p>}
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>✓ Get it by May 8 — Fast Delivery available</li>
              <li><i className="fa fa-tag mr-1" /> Best Price</li>
              <li><i className="fa fa-inr mr-1" /> Cash on Delivery</li>
              <li><i className="fa fa-clock-o mr-1" /> 8 days Return</li>
            </ul>
          </div>

          {/* Product Details */}
          <div className="border border-gray-200 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <h5 className="font-semibold text-[#800000] flex items-center gap-2">
              <i className="fa fa-cube" /> Product Details
            </h5>
            {product.description && <p className="text-gray-600">{product.description}</p>}
            {selectedSize?.size && <p><span className="font-medium">Size:</span> {selectedSize.size}</p>}
            {product.brand && <p><span className="font-medium">Brand:</span> {product.brand}</p>}
            {product.speciality && <p><span className="font-medium">Speciality:</span> {product.speciality}</p>}
            {product.metaTitle && <p><span className="font-medium">Material:</span> {product.metaTitle}</p>}
          </div>

          {/* Customer Reviews Summary */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Customer Reviews</h4>
              <button
                onClick={() => navigate(`/all-reviews/${id}`)}
                className="text-xs text-[#800000] hover:underline">
                View All ({reviews.length})
              </button>
            </div>
            {avgRating && (
              <div className="flex items-center gap-2 mb-3">
                {[1,2,3,4,5].map(n => (
                  <i key={n} className={`fa fa-star text-sm ${n <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-600">{avgRating} / 5</span>
              </div>
            )}
            <div className="space-y-1.5">
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => Math.round(r.rating) === star).length
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                return (
                  <div key={star} className="rating-bar">
                    <span className="label text-xs">{star} ★</span>
                    <div className="progress-container"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs text-gray-500 w-8">{pct}%</span>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => { if (!user) { setLoginModalOpen(true); return }; setReviewDialogOpen(true) }}
              className="mt-3 w-full border border-[#800000] text-[#800000] py-2 rounded-lg text-sm hover:bg-[#800000] hover:text-white transition-all">
              Write a Review
            </button>

            {/* Latest 3 reviews */}
            {reviews.slice(0, 3).map((r, i) => (
              <div key={i} className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-1">
                  {[1,2,3,4,5].map(n => (
                    <i key={n} className={`fa fa-star text-xs ${n <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-xs text-gray-500">{r.userId?.name || 'Customer'}</span>
                </div>
                <p className="text-xs text-gray-600">{r.text}</p>
                {r.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {r.images.map((img, j) => (
                      <img key={j} src={img} alt="" className="w-12 h-12 rounded object-cover cursor-pointer"
                        onClick={() => setPopupImg(img)} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Popup */}
      {popupImg && <ImagePopup src={popupImg} onClose={() => setPopupImg(null)} />}

      {/* Review Dialog */}
      {reviewDialogOpen && (
        <ReviewDialog
          productId={id}
          userId={user?._id || user?.id}
          onClose={() => setReviewDialogOpen(false)}
          onSuccess={() => {
            setReviewDialogOpen(false)
            getReview(id).then(r => setReviews(r.data?.reviews || r.data || [])).catch(() => {})
          }}
        />
      )}
    </div>
  )
}
