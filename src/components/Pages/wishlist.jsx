import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { addToCart, addWishlist } from '../services/api'
import emptyWishlistImg from '../assets/images/Empty-wishlist.png'

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function getPriceParts(product) {
  const size = product?.variants?.[0]?.sizes?.[0]
  const price = size?.price ?? null
  const finalPrice = size?.finalPrice ?? null
  const discount = size?.discountPercentage ?? null
  return { price, finalPrice, discount }
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const { user, wishlist, addToWishlistLocal, loadCart } = useApp()
  const userId = user?._id || user?.id

  const [notice, setNotice] = useState('')

  const showNotice = (message, ms = 2000) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), ms)
  }

  async function handleRemove(product) {
    if (!product?._id) return
    if (!userId) {
      navigate('/login')
      showNotice('Please login first.', 2500)
      return
    }

    try {
      await addWishlist({ userId, productId: product._id })
    } catch {
      // ignore backend failure; keep local UX responsive
    } finally {
      addToWishlistLocal(product)
      showNotice('Removed from wishlist')
    }
  }

  async function handleAddToCart(product) {
    if (!userId) {
      navigate('/login')
      showNotice('Please login first.', 2500)
      return
    }

    const firstVariant = product?.variants?.[0] || null
    const firstSize = firstVariant?.sizes?.[0] || null
    if (!firstSize) {
      showNotice('This product has no size/price', 2500)
      return
    }

    try {
      await addToCart({
        userId,
        items: [{
          productId: product._id,
          image: firstVariant?.images?.[0]?.url || product.image,
          variant: {
            color: firstVariant?.color,
            size: firstSize?.size,
            price: String(firstSize?.price),
            discountPercentage: String(firstSize?.discountPercentage),
            rating: String(firstVariant?.rating),
          },
          quantity: 1,
        }],
      })
      loadCart()
      showNotice('Added to cart')
    } catch {
      showNotice('Failed to add to cart', 2500)
    }
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"DM Sans","Roboto",sans-serif' }}>
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#681117] hover:bg-black/5"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[#681117] hover:bg-black/5"
          >
            Home
          </button>
        </div>

        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-wide text-[#681117] sm:text-3xl">
          This is Your Wishlist
        </h2>

        {notice ? (
          <div className="mx-auto mt-4 w-full max-w-xl rounded-md border border-black/10 bg-white p-3 text-center text-sm font-semibold text-[#681117] shadow-sm">
            {notice}
          </div>
        ) : null}

        {!userId ? (
          <div className="mt-10 rounded-md border border-black/10 bg-white p-4 text-center text-sm text-black/60">
            Please login to view your wishlist.
            <div className="mt-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-md bg-[#681117] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Login
              </button>
            </div>
          </div>
        ) : null}

        {userId && !wishlist.length ? (
          <div className="mt-10 text-center text-black/60">
            <img src={emptyWishlistImg} alt="Empty wishlist" className="mx-auto h-52 w-auto" />
            <h3 className="mt-4 text-lg font-semibold text-[#681117]">Sorry, your wishlist is empty!</h3>
            <p className="mt-1 text-sm">Start adding your favorite products.</p>
          </div>
        ) : null}

        {userId && wishlist.length ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((product) => {
              const { price, finalPrice, discount } = getPriceParts(product)
              return (
                <div key={product?._id} className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => navigate(`/product-details/${encodeURIComponent(product?._id || '')}`)}
                    className="w-full text-left"
                  >
                    {product?.image ? (
                      <img
                        src={product.image}
                        alt={product?.name || 'Product'}
                        className="h-[220px] w-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-[220px] items-center justify-center text-sm text-black/50">No image</div>
                    )}
                  </button>

                  <div className="p-4">
                    <div className="line-clamp-2 text-base font-semibold text-[#681117]">
                      {titleCase(product?.name || '')}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-black/50">{product?.slug || ''}</div>

                    <div className="mt-3 text-sm font-bold text-black">
                      {discount ? (
                        <span className="mr-2 text-black/50 line-through">{price != null ? `₹${price}` : ''}</span>
                      ) : null}
                      <span className="text-[#681117]">{finalPrice != null ? `₹${finalPrice}` : ''}</span>
                      {discount ? <span className="ml-2 text-xs font-semibold text-red-600">({discount}% OFF)</span> : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        <span>Add to Cart</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(product)}
                        className="grid h-10 w-10 place-items-center rounded-md border border-black/10 bg-white text-red-600 hover:bg-black/5"
                        aria-label="Remove"
                        title="Remove"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M6 6l1 16h10l1-16" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}