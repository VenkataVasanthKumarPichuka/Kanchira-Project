import { useEffect, useState } from "react"

export default function FilterSidebar({
  products = [],
  maxPrice,
  setMaxPrice,
  selectedColor,
  setSelectedColor,
  discounts,
  setDiscounts
}) {
  const [colors, setColors] = useState([])
  const [maxRange, setMaxRange] = useState(5000)

  useEffect(() => {
    if (!products.length) return

    const prices = products.flatMap(p =>
      p.variants?.flatMap(v =>
        v.sizes?.map(s => s.finalPrice || 0)
      ) || []
    )

    setMaxRange(Math.max(...prices, 5000))

    const uniqueColors = []
    products.forEach(p => {
      p.variants?.forEach(v => {
        if (v.color && !uniqueColors.find(c => c.name === v.color)) {
          uniqueColors.push({
            name: v.color,
            code: v.colorCode || "#ccc"
          })
        }
      })
    })

    setColors(uniqueColors)

  }, [products])

  const toggleDiscount = (d) => {
    setDiscounts(prev =>
      prev.includes(d)
        ? prev.filter(x => x !== d)
        : [...prev, d]
    )
  }

  return (
    <div className="w-64 space-y-6 p-4 bg-white rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg">

      <h3 className="font-semibold text-[#800000] text-lg">Filters</h3>

      {/* PRICE */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Price</p>
        <input
          type="range"
          min="0"
          max={maxRange}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#800000] cursor-pointer transition-all duration-200"
        />
        <p className="text-xs text-gray-500">₹0 - ₹{maxPrice}</p>
      </div>

      {/* COLOR */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Color</p>

        <div className="flex flex-wrap gap-2">
          {colors.map(c => (
            <div
              key={c.name}
              onClick={() => setSelectedColor(c.name)}
              className={`
                flex items-center gap-2 px-2 py-1 rounded cursor-pointer border transition-all duration-200
                ${selectedColor === c.name 
                  ? "border-[#800000] bg-[#800000]/10 scale-105" 
                  : "border-gray-200 hover:border-[#800000]/50"}
              `}
            >
              {/* Color Circle */}
              <span
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: c.code }}
              ></span>

              <span className="text-xs capitalize">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DISCOUNT */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Discount</p>

        {[10, 20, 30, 40, 50].map(d => (
          <label
            key={d}
            className="flex items-center gap-2 text-sm cursor-pointer transition-all duration-200 hover:translate-x-1"
          >
            <input
              type="checkbox"
              checked={discounts.includes(d)}
              onChange={() => toggleDiscount(d)}
              className="accent-[#800000]"
            />
            {d}% +Discount
          </label>
        ))}
      </div>

    </div>
  )
}