import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { wishlist, addToWishlistLocal, user, setLoginModalOpen } = useApp()

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <i className="fa fa-heart-o text-5xl text-gray-300" />
      <p className="text-gray-500">Please login to view your wishlist</p>
      <button className="btn-maroon w-40" onClick={() => setLoginModalOpen(true)}>Login</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <h1 className="text-xl font-bold mb-6">My Wishlist ({wishlist.length})</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <i className="fa fa-heart-o text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <button className="btn-maroon w-40" onClick={() => navigate('/')}>Shop Now</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlist.map(pro => (
            <div key={pro._id} className="product-card">
              <div className="relative">
                <img
                  src={pro.image}
                  alt={pro.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/product-details/${pro._id}`)}
                  onError={e => { e.target.src = 'https://via.placeholder.com/200' }}
                />
                <button
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center"
                  onClick={() => { addToWishlistLocal(pro); toast.success('Removed from wishlist') }}>
                  <i className="fa fa-heart text-red-500 text-sm" />
                </button>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium capitalize line-clamp-2">{pro.name}</p>
                {pro.variants?.[0]?.sizes?.[0] && (
                  <p className="text-sm font-bold text-[#800000] mt-1">₹{pro.variants[0].sizes[0].finalPrice}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
