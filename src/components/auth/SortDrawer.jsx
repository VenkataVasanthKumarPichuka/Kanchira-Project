import { useEffect, useState } from "react"

export default function SortDrawer({ open, onClose, products, setProducts }) {
  const [brands, setBrands] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])

  useEffect(() => {
    if (!products.length) return

    // Extract unique brands
    const unique = []
    products.forEach(p => {
      if (p.brand && !unique.includes(p.brand)) {
        unique.push(p.brand)
      }
    })

    setBrands(unique)
  }, [products])

  if (!open) return null

  // Sorting
  const sortByPriceLow = () => {
    setProducts([...products].sort((a, b) =>
      (a.variants?.[0]?.sizes?.[0]?.finalPrice || 0) -
      (b.variants?.[0]?.sizes?.[0]?.finalPrice || 0)
    ))
    onClose()
  }

  const sortByPriceHigh = () => {
    setProducts([...products].sort((a, b) =>
      (b.variants?.[0]?.sizes?.[0]?.finalPrice || 0) -
      (a.variants?.[0]?.sizes?.[0]?.finalPrice || 0)
    ))
    onClose()
  }

  // Brand toggle
  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  // Apply brand filter
  const applyBrandFilter = () => {
    if (selectedBrands.length === 0) return

    const filtered = products.filter(p =>
      selectedBrands.includes(p.brand)
    )

    setProducts(filtered)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">

      <div className="bg-white w-full p-4 rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slideUp">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sort & Filter</h3>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        {/* SORT */}
        <div className="mb-6">
          <h4 className="font-medium mb-2">Sort By</h4>

          <div className="space-y-2">
            <button
              onClick={sortByPriceLow}
              className="block w-full text-left py-2 px-2 rounded hover:bg-gray-100"
            >
              Price Low → High
            </button>

            <button
              onClick={sortByPriceHigh}
              className="block w-full text-left py-2 px-2 rounded hover:bg-gray-100"
            >
              Price High → Low
            </button>
          </div>
        </div>

        {/* BRANDS */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            Brands
            <span className="text-xs text-gray-400">▲</span>
          </h4>

          <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
            {brands.length === 0 ? (
              <p className="text-sm text-gray-400">No brands found</p>
            ) : (
              brands.map((brand, i) => (
                <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="accent-[#800000]"
                  />
                  {brand}
                </label>
              ))
            )}
          </div>
        </div>

        {/* APPLY BUTTON */}
        <button
          onClick={applyBrandFilter}
          className="w-full bg-[#800000] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Apply Filters
        </button>

      </div>
    </div>
  )
}