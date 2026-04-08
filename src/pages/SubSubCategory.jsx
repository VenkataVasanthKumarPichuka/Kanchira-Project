import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getProducts,
  getProductsBySubCategory,
  getSub_SubCategoryById
} from '../services/api'

import FilterSidebar from '../components/auth/FilterSidebar'
import SortDrawer from '../components/auth/SortDrawer'

export default function SubSubCategory() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])

  const [subSubCats, setSubSubCats] = useState([])
  const [selectedSubSubId, setSelectedSubSubId] = useState(null)

  const [loading, setLoading] = useState(true)

  // FILTER STATES
  const [maxPrice, setMaxPrice] = useState(5000)
  const [selectedColor, setSelectedColor] = useState(null)
  const [discounts, setDiscounts] = useState([])

  // MOBILE
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)

  // EXTRA
  const [wishlist, setWishlist] = useState([])
  const [quickView, setQuickView] = useState(null)

  const subCategoryId = id || localStorage.getItem('subCategoryId')

  /* ---------- LOAD SUB SUB CATEGORY ---------- */
  useEffect(() => {
    if (!subCategoryId) return

    getSub_SubCategoryById(subCategoryId)
      .then(r => {
        const list =
          r?.data?.Sub_SubCategories ||
          r?.data?.sub_SubCategories ||
          r?.data ||
          []

        setSubSubCats(list)

        if (list.length > 0) {
          loadProducts(list[0]._id)
        }
      })
      .finally(() => setLoading(false))
  }, [subCategoryId])

  /* ---------- LOAD PRODUCTS ---------- */
  const loadProducts = (subSubId) => {
    setSelectedSubSubId(subSubId)
    setLoading(true)

    getProductsBySubCategory(subSubId)
      .then(r => {
        const list =
          r?.data?.products ||
          r?.data?.Products ||
          r?.data ||
          []

        if (list.length) {
          setProducts(list)
          setFilteredProducts(list)
          return
        }

        return getProducts().then(res => {
          const all = res.data?.products || res.data || []
          const filtered = all.filter(p =>
            (p.subsubcategoryId?._id || p.subsubcategoryId) === subSubId
          )
          setProducts(filtered)
          setFilteredProducts(filtered)
        })
      })
      .finally(() => setLoading(false))
  }

  /* ---------- FILTER LOGIC ---------- */
  useEffect(() => {
    let temp = [...products]

    // PRICE
    temp = temp.filter(p =>
      p.variants?.some(v =>
        v.sizes?.some(s => s.finalPrice <= maxPrice)
      )
    )

    // COLOR
    if (selectedColor) {
      temp = temp.filter(p =>
        p.variants?.some(v => v.color === selectedColor)
      )
    }

    // DISCOUNT
    if (discounts.length) {
      temp = temp.filter(p =>
        p.variants?.some(v =>
          v.sizes?.some(s =>
            discounts.some(d => (s.discountPercentage || 0) >= d)
          )
        )
      )
    }

    setFilteredProducts(temp)
  }, [products, maxPrice, selectedColor, discounts])

  /* ---------- WISHLIST ---------- */
  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p._id === product._id)
      if (exists) return prev.filter(p => p._id !== product._id)
      return [...prev, product]
    })
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* CATEGORY TABS */}
      <div className="bg-white border-b sticky top-[88px] z-30 overflow-x-auto">
        <div className="flex gap-2 px-4 py-2 whitespace-nowrap">
          {subSubCats.map(ss => (
            <button
              key={ss._id}
              onClick={() => loadProducts(ss._id)}
              className={`px-4 py-1.5 rounded-full text-sm ${
                selectedSubSubId === ss._id
                  ? 'bg-[#800000] text-white'
                  : 'border'
              }`}
            >
              {ss.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 p-4">

        {/* SIDEBAR */}
        <div className="hidden lg:block">
          <FilterSidebar
            products={products}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            discounts={discounts}
            setDiscounts={setDiscounts}
          />
        </div>

        {/* PRODUCTS */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {filteredProducts.map(pro => (
                <div
                  key={pro._id}
                  className="bg-white p-2 rounded shadow relative group"
                >

                  {/* IMAGE */}
                  <img
                    src={pro.image}
                    className="w-full h-52 object-cover rounded cursor-pointer"
                    onClick={() => navigate(`/product-details/${pro._id}`)}
                  />

                  {/* ICONS */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">

                    {/* WISHLIST */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(pro)
                      }}
                      className="bg-white p-1.5 rounded-full shadow"
                    >
                      <svg
                        className="w-5 h-5"
                        fill={wishlist.find(p => p._id === pro._id) ? "#800000" : "none"}
                        stroke="#800000"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </button>

                    {/* QUICK VIEW */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setQuickView(pro)
                      }}
                      className="bg-white p-1.5 rounded-full shadow"
                    >
                      👁
                    </button>
                  </div>

                  {/* NAME */}
                  <p className="text-xs mt-2 line-clamp-2">{pro.name}</p>

                  {/* PRICE */}
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <span className="text-lg font-bold text-[#800000]">
                      ₹{pro?.variants?.[0]?.sizes?.[0]?.finalPrice || "N/A"}
                    </span>

                    {pro?.variants?.[0]?.sizes?.[0]?.discountPercentage > 0 && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          ₹{pro?.variants?.[0]?.sizes?.[0]?.price}
                        </span>

                        {/* <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                          {pro?.variants?.[0]?.sizes?.[0]?.discountPercentage}% OFF
                        </span> */}
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIEW */}
      {quickView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg p-4 relative">

            <button
              onClick={() => setQuickView(null)}
              className="absolute top-2 right-2 text-xl"
            >
              ✕
            </button>

            <div className="grid md:grid-cols-2 gap-4">

              <img
                src={quickView.image}
                className="w-full h-80 object-cover rounded"
              />

              <div className="space-y-3">
                <h2 className="text-lg font-semibold">{quickView.name}</h2>

                <p className="text-[#800000] font-bold text-lg">
                  ₹{quickView?.variants?.[0]?.sizes?.[0]?.finalPrice || "N/A"}
                </p>

                <p className="text-sm text-gray-600">
                  {quickView.description || "No description"}
                </p>

                <button
                  onClick={() => navigate(`/product-details/${quickView._id}`)}
                  className="bg-[#800000] text-white px-4 py-2 rounded"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FILTER */}
      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="bg-white w-80 h-full p-4">
            <div className="flex justify-between mb-3">
              <h3>Filters</h3>
              <button onClick={() => setShowFilters(false)}>✕</button>
            </div>

            <FilterSidebar
              products={products}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              discounts={discounts}
              setDiscounts={setDiscounts}
            />
          </div>
        </div>
      )}

      {/* SORT */}
      <SortDrawer
        open={showSort}
        onClose={() => setShowSort(false)}
        products={filteredProducts}
        setProducts={setFilteredProducts}
      />

      {/* MOBILE BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex lg:hidden">
        <button onClick={() => setShowSort(true)} className="flex-1 py-3 border-r">
          Sort
        </button>
        <button onClick={() => setShowFilters(true)} className="flex-1 py-3">
          Filter
        </button>
      </div>

    </div>
  )
}