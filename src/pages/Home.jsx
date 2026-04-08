import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBanners, getCategories, getSubCategories, getProducts } from '../services/api'
import DiscountSpin from '../components/DiscountSpin'
import AOS from 'aos'
import 'aos/dist/aos.css'
import banar2 from '../assets/images/baner2.png'
import banar3 from '../assets/images/baner3.png'

export default function Home() {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [bannerIdx, setBannerIdx] = useState(0)
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [catLoading, setCatLoading] = useState(true)
  const [hoveredCat, setHoveredCat] = useState(null)
  const [hoveredSub, setHoveredSub] = useState(null)
  const subRef = useRef(null)

  useEffect(() => {
    AOS.init({ duration: 900, easing: 'ease-in-out', once: true })
    getBanners().then(r => setBanners(r.data?.banners || [])).catch(() => {})
    getCategories().then(r => {
      const cats = Array.isArray(r.data) ? r.data : r.data?.categories ?? r.data?.data ?? []
      setCategories(cats)
      setCatLoading(false)
    }).catch(() => setCatLoading(false))
    getSubCategories().then(r => {
      const raw = r.data?.SubCategories ?? r.data?.subCategories ?? r.data
      setSubCategories(Array.isArray(raw) ? raw : [])
    }).catch(() => {})
    getProducts().then(r => {
      const p = Array.isArray(r.data) ? r.data : r.data?.products || []
      setAllProducts(p)
    }).catch(() => {})
  }, [])

  // Banner auto-slide
  useEffect(() => {
    if (banners.length === 0) return
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 3000)
    return () => clearInterval(timer)
  }, [banners.length])

  const goToSubSub = (subCatId) => {
    localStorage.setItem('subCategoryId', subCatId)
    navigate('/subsubcategory')
  }

  const onCategoryClick = (cat) => {
    if (activeCategoryId === cat._id) {
      setActiveCategoryId('')
      setSelectedCategoryId(null)
      return
    }
    setActiveCategoryId(cat._id)
    if (cat.name.toLowerCase() === 'all') {
      setSelectedCategoryId(null)
    } else {
      setSelectedCategoryId(cat._id)
      setTimeout(() => {
        if (subRef.current) {
          const top = subRef.current.getBoundingClientRect().top + window.scrollY - 100
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const getSubsByCat = (catId) => subCategories.filter(s => s.categoryId === catId)

  const isNewProduct = (p) => {
    if (!p.createdAt) return false
    return (Date.now() - new Date(p.createdAt).getTime()) / 86400000 <= 7
  }

  const latestProducts = [...allProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 16)

  return (
    <div className="min-h-screen bg-[#faf8f6]" style={{ fontFamily: "'Jost', sans-serif" }}>

      {/* ─────────────────────────────────────────
          GOOGLE FONTS IMPORT (add to index.html head instead ideally)
      ───────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500;600&display=swap');

        .cat-card-img { transition: transform 0.45s ease; }
        .cat-card:hover .cat-card-img { transform: scale(1.06); }

        .sub-card-img { transition: transform 0.35s ease; }
        .sub-card:hover .sub-card-img { transform: scale(1.05); }

        .product-card-img { transition: transform 0.35s ease; }
        .product-card:hover .product-card-img { transform: scale(1.07); }

        .banner-dot { transition: all 0.3s ease; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .subcats-reveal { animation: fadeSlideUp 0.35s ease forwards; }

        .section-underline::after {
          content: '';
          display: block;
          width: 48px;
          height: 2px;
          background: #800020;
          margin: 8px auto 0;
          border-radius: 2px;
        }
      `}</style>

      {/* ─────────────────────────────────────────
          BANNER CAROUSEL
      ───────────────────────────────────────── */}
      {banners.length > 0 && (
        <div className="relative overflow-hidden bg-gray-100">
          {/* Slides */}
          {banners.map((b, i) => (
            <img
              key={i}
              src={b.image}
              alt="Banner"
              className={`w-full object-cover transition-opacity duration-700 ${
                i === bannerIdx ? 'block opacity-100' : 'hidden opacity-0'
              }`}
              style={{ height: 340, objectFit: 'cover' }}
            />
          ))}

          {/* Prev / Next */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-[#800020] text-lg font-semibold flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
            onClick={() => setBannerIdx(i => (i - 1 + banners.length) % banners.length)}
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white text-[#800020] text-lg font-semibold flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
            onClick={() => setBannerIdx(i => (i + 1) % banners.length)}
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`banner-dot rounded-full border-none cursor-pointer ${
                  i === bannerIdx
                    ? 'w-6 h-2 bg-[#800020]'
                    : 'w-2 h-2 bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>

          {/* Spin Wheel */}
          <div className="absolute bottom-4 right-4">
            <DiscountSpin mini />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────
          STATIC BANNER 2
      ───────────────────────────────────────── */}
      <div className="w-full">
        <img
          src={banar2}
          alt=""
          className="w-full object-cover"
          onError={e => (e.target.style.display = 'none')}
        />
      </div>

      {/* ─────────────────────────────────────────
          CATEGORIES SECTION
      ───────────────────────────────────────── */}
      <section className="mt-10 mb-6">

        {/* Section Title */}
        <div className="text-center py-6 px-4" style={{ background: 'linear-gradient(180deg, #fff0f3 0%, #faf8f6 100%)' }}>
          <h2
            className="uppercase tracking-[0.2em] text-[#800020] section-underline"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 600, margin: 0 }}
          >
            Category
          </h2>
          <p className="text-xs text-[#b07080] tracking-widest mt-3 font-light">
            Explore our curated collections
          </p>
        </div>

        {/* Category Cards */}
        {catLoading ? (
          <div className="flex justify-center items-center py-14">
            <div className="w-8 h-8 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            className="flex flex-wrap gap-5 justify-center px-4 pt-6 pb-2"
            data-aos="fade-up"
          >
            {categories.map((cat, idx) => (
              <div
                key={cat._id}
                className="cat-card flex flex-col items-center gap-2 cursor-pointer group"
                style={{ width: 158 }}
                onClick={() => onCategoryClick(cat)}
                onMouseEnter={() => setHoveredCat(cat._id)}
                onMouseLeave={() => setHoveredCat(null)}
                data-aos="fade-up"
                data-aos-delay={idx * 80}
              >
                {/* Image Box */}
                <div
                  className="overflow-hidden rounded-[4px] w-full"
                  style={{
                    height: 200,
                    border: activeCategoryId === cat._id || hoveredCat === cat._id
                      ? '1.5px solid #800020'
                      : '1.5px solid #e8d5d8',
                    transition: 'border-color 0.25s ease',
                    background: '#f5ece8',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="cat-card-img w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/158x200?text=' + cat.name }}
                  />
                </div>

                {/* Label */}
                <span
                  className="text-[13px] text-center capitalize tracking-wide transition-colors duration-200"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: activeCategoryId === cat._id ? 500 : 400,
                    color: activeCategoryId === cat._id || hoveredCat === cat._id ? '#800020' : '#555',
                  }}
                >
                  {cat.name}
                </span>

                {/* Active indicator line */}
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: 20,
                    height: 2,
                    background: '#800020',
                    opacity: activeCategoryId === cat._id ? 1 : 0,
                    transform: activeCategoryId === cat._id ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────
          SUBCATEGORIES (after category click)
      ───────────────────────────────────────── */}
      {selectedCategoryId && (
        <div ref={subRef} className="mb-10 subcats-reveal">
          {/* Sub-section divider */}
          <div className="flex items-center gap-3 px-8 mb-5">
            <div className="flex-1 h-px bg-[#f0d8dc]" />
            <span
              className="text-xs uppercase tracking-[0.18em] text-[#b07080]"
              style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
            >
              {categories.find(c => c._id === selectedCategoryId)?.name}
            </span>
            <div className="flex-1 h-px bg-[#f0d8dc]" />
          </div>

          <div className="flex flex-wrap gap-4 px-6 justify-center">
            {getSubsByCat(selectedCategoryId).map((sub, idx) => (
              <div
                key={sub._id}
                className="sub-card flex flex-col items-center gap-2 cursor-pointer group"
                style={{ width: 120 }}
                onClick={() => goToSubSub(sub._id)}
                onMouseEnter={() => setHoveredSub(sub._id)}
                onMouseLeave={() => setHoveredSub(null)}
                data-aos="zoom-in"
                data-aos-delay={idx * 60}
              >
                <div
                  className="overflow-hidden rounded-[4px] w-full"
                  style={{
                    height: 148,
                    border: hoveredSub === sub._id ? '1.5px solid #800020' : '1.5px solid #e8d5d8',
                    transition: 'border-color 0.25s ease',
                    background: '#f5ece8',
                  }}
                >
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="sub-card-img w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/120x148?text=' + sub.name }}
                  />
                </div>
                <span
                  className="text-[11.5px] text-center capitalize tracking-wide transition-colors duration-200"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    color: hoveredSub === sub._id ? '#800020' : '#666',
                    fontWeight: hoveredSub === sub._id ? 500 : 400,
                  }}
                >
                  {sub.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────
          LATEST PRODUCTS
      ───────────────────────────────────────── */}
      {latestProducts.length > 0 && (
        <section className="mb-10 px-4">
          {/* Section Title */}
          <div className="text-center mb-6">
            <h2
              className="uppercase tracking-[0.18em] text-[#800020] section-underline"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600 }}
            >
              Latest Products
            </h2>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-aos="fade-up"
          >
            {latestProducts.map((pro, idx) => (
              <div
                key={pro._id}
                className="product-card group cursor-pointer bg-white rounded-[4px] overflow-hidden"
                style={{ border: '1px solid #eedfe2', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#800020'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(128,0,32,0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#eedfe2'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                onClick={() => goToSubSub(pro.subcategoryId)}
                data-aos="fade-up"
                data-aos-delay={Math.min(idx * 50, 400)}
              >
                <div className="relative overflow-hidden" style={{ height: 200 }}>
                  <img
                    src={pro.image}
                    alt={pro.name}
                    className="product-card-img w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/200' }}
                  />
                  {isNewProduct(pro) && (
                    <span
                      className="absolute top-2 left-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-[2px]"
                      style={{ background: '#800020', color: '#fff', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}
                    >
                      New
                    </span>
                  )}
                </div>
                <div className="p-2 pb-3">
                  <p
                    className="text-[12px] capitalize line-clamp-2 leading-snug"
                    style={{ color: '#444', fontFamily: "'Jost', sans-serif" }}
                  >
                    {pro.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────
          ALL CATEGORIES WITH SUBCATEGORIES
      ───────────────────────────────────────── */}
      {categories.map((cat, catIdx) => {
        const subs = getSubsByCat(cat._id)
        if (!subs.length) return null
        return (
          <section key={cat._id} className="mb-12 px-4" data-aos="fade-up" data-aos-delay={catIdx * 60}>
            {/* Category heading with decorative lines */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-[#f0d8dc]" />
              <h3
                className="uppercase tracking-[0.16em] text-[#800020] text-sm"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600 }}
              >
                {cat.name}
              </h3>
              <div className="flex-1 h-px bg-[#f0d8dc]" />
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {subs.map((sub, subIdx) => (
                <div
                  key={sub._id}
                  className="sub-card flex flex-col items-center gap-2 cursor-pointer"
                  style={{ width: 120 }}
                  onClick={() => goToSubSub(sub._id)}
                  onMouseEnter={() => setHoveredSub(sub._id)}
                  onMouseLeave={() => setHoveredSub(null)}
                  data-aos="zoom-in"
                  data-aos-delay={subIdx * 50}
                >
                  <div
                    className="overflow-hidden rounded-[4px] w-full"
                    style={{
                      height: 148,
                      border: hoveredSub === sub._id ? '1.5px solid #800020' : '1.5px solid #e8d5d8',
                      transition: 'border-color 0.25s ease',
                      background: '#f5ece8',
                    }}
                  >
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="sub-card-img w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://via.placeholder.com/120x148?text=' + sub.name }}
                    />
                  </div>
                  <span
                    className="text-[11.5px] text-center capitalize tracking-wide transition-colors duration-200"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: hoveredSub === sub._id ? '#800020' : '#666',
                      fontWeight: hoveredSub === sub._id ? 500 : 400,
                    }}
                  >
                    {sub.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* ─────────────────────────────────────────
          OFFER BANNER 3
      ───────────────────────────────────────── */}
      <div className="w-full mb-8">
        <img
          src={banar3}
          alt=""
          className="w-full object-cover"
          onError={e => (e.target.style.display = 'none')}
        />
      </div>

    </div>
  )
}