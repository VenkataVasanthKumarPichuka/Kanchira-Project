import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCategories, getSubCategories, getSub_SubCategoryById } from '../services/api'
import toast from 'react-hot-toast'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout, cartCount, wishlist, logoUrl, setLoginModalOpen } = useApp()

  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [megaMenuCatId, setMegaMenuCatId] = useState(null)
  const [megaData, setMegaData] = useState([])
  const [megaLoading, setMegaLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showChips, setShowChips] = useState(false)
  const [slugs, setSlugs] = useState([])
  const [filteredSlugs, setFilteredSlugs] = useState([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCatOpen, setMobileCatOpen] = useState(null)
  const [mobileSubOpen, setMobileSubOpen] = useState(null)
  const [mobileSubData, setMobileSubData] = useState({})
  const megaTimer = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    getCategories().then(r => {
      const cats = Array.isArray(r.data) ? r.data : r.data?.categories ?? r.data?.data ?? []
      setCategories(cats)
    }).catch(() => {})
    getSubCategories().then(r => {
      const raw = r.data?.SubCategories ?? r.data?.subCategories ?? r.data
      const subs = Array.isArray(raw) ? raw : []
      setSubCategories(subs)
      const s = subs.map(sub => ({ slug: sub.name, _id: sub._id, categoryId: sub.categoryId }))
      setSlugs(s); setFilteredSlugs(s)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowChips(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const openMegaMenu = (catId) => {
    clearTimeout(megaTimer.current)
    if (megaMenuCatId === catId) return
    setMegaMenuCatId(catId); setMegaData([]); setMegaLoading(true)
    const subs = subCategories.filter(s => s.categoryId === catId)
    Promise.all(subs.map(sub =>
      getSub_SubCategoryById(sub._id)
        .then(r => {
          const raw = r.data?.Sub_SubCategories ?? r.data?.subSubCategories ?? r.data
          return { id: sub._id, title: sub.name, subSubCategories: Array.isArray(raw) ? raw : [] }
        })
        .catch(() => ({ id: sub._id, title: sub.name, subSubCategories: [] }))
    )).then(data => { setMegaData(data); setMegaLoading(false) })
  }

  const closeMegaMenu = () => {
    megaTimer.current = setTimeout(() => { setMegaMenuCatId(null); setMegaData([]) }, 150)
  }

  const filterSlugs = (val) => {
    setSearchTerm(val); setShowChips(true)
    if (!val.trim()) { setFilteredSlugs(slugs); return }
    setFilteredSlugs(slugs.filter(s => s.slug.toLowerCase().includes(val.toLowerCase())))
  }

  const goToSubSub = (subCatId) => {
    localStorage.setItem('subCategoryId', subCatId)
    navigate('/subsubcategory')
    setMegaMenuCatId(null); setMobileOpen(false); setShowChips(false); setSearchTerm('')
  }

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/') }

  const expandMobileSub = async (subId) => {
    if (mobileSubOpen === subId) { setMobileSubOpen(null); return }
    setMobileSubOpen(subId)
    if (!mobileSubData[subId]) {
      try {
        const r = await getSub_SubCategoryById(subId)
        const raw = r.data?.Sub_SubCategories ?? r.data?.subSubCategories ?? r.data
        setMobileSubData(p => ({ ...p, [subId]: Array.isArray(raw) ? raw : [] }))
      } catch { setMobileSubData(p => ({ ...p, [subId]: [] })) }
    }
  }

  const isWishlistEmpty = wishlist.length === 0
  const activeCatName = categories.find(c => c._id === megaMenuCatId)?.name

  return (
    <div className="sticky top-0 z-50 bg-white" style={{boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>

      {/* Topbar */}
      <div className="bg-[#800000] text-white text-xs flex items-center justify-between px-6 py-1">
        <span className="font-medium tracking-wide">Launching Soon</span>
        <button className="border border-white/30 rounded px-3 py-0.5 hover:bg-white/10 transition-colors text-xs">Download</button>
      </div>

      {/* Main Nav */}
      {/* <nav className="flex items-center gap-4 px-6 h-16"> */}
        <nav className="flex items-center gap-2 px-6 h-16">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          {logoUrl
            ? <img src={logoUrl} alt="Kanchira" className="h-12 object-contain" />
            : <span className="text-xl font-bold text-[#800000]">Kanchira</span>}
        </Link>

        {/* Category Links desktop */}
<ul className="hidden md:flex items-stretch list-none h-full gap-0 overflow-x-auto">     
       {categories.slice(0, 6).map(cat => (
            <li key={cat._id} className="flex items-center"
              onMouseEnter={() => openMegaMenu(cat._id)}
              onMouseLeave={closeMegaMenu}>
              <span className={`
                relative px-2 h-full flex items-center text-sm font-semibold cursor-pointer capitalize transition-colors select-none
                ${megaMenuCatId === cat._id ? 'text-[#800000]' : 'text-gray-800 hover:text-[#800000]'}
              `}>
                {cat.name}
                {megaMenuCatId === cat._id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#800000]" />
                )}
              </span>
            </li>
          ))}
        </ul>

        {/* Search */}
       <div className="flex-1 hidden md:flex justify-center px-2">
  <div
    ref={searchRef}
    className="
      relative w-full 
      max-w-md        /* tablet */
      lg:max-w-lg     /* desktop */
      xl:max-w-xl     /* large desktop optional */
    "
  >
            <div className="flex items-center border border-gray-300 bg-white focus-within:border-[#800000] transition-colors" style={{borderRadius:2}}>
              <input
                type="text" value={searchTerm}
                onChange={e => filterSlugs(e.target.value)}
                onFocus={() => setShowChips(true)}
                placeholder="Search ..."
                className="flex-1 px-4 py-2 text-sm outline-none bg-transparent"
              />
              <button className="px-3 text-gray-400 hover:text-[#800000]">
                <i className="fa fa-search" />
              </button>
            </div>
            {showChips && filteredSlugs.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl z-50 max-h-72 overflow-y-auto mt-0.5 rounded-b">
                {filteredSlugs.slice(0, 20).map(item => (
                  <div key={item._id}
                    className="px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 hover:text-[#800000] capitalize border-b border-gray-50 last:border-0 flex items-center gap-2"
                    onClick={() => goToSubSub(item._id)}>
                    <i className="fa fa-search text-xs text-gray-300" /> {item.slug}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5 ml-auto">

          {/* Wishlist */}
          <button title="Wishlist" onClick={() => navigate('/wishlist')}
            className="text-gray-700 hover:text-[#800000] transition-colors">
            <svg className="w-6 h-6" fill={isWishlistEmpty?'none':'#800000'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          {/* User */}
          {user ? (
            <div className="relative group">
              <button className="text-gray-700 hover:text-[#800000] transition-colors flex items-center gap-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <span className="text-xs font-medium hidden xl:block capitalize">{user.name?.split(' ')[0]}</span>
              </button>
              <div className="hidden group-hover:block absolute right-0 top-9 bg-white border border-gray-200 rounded shadow-lg min-w-40 z-50 py-1">
                <div className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  onClick={() => navigate('/profile')}>
                  <i className="fa fa-user-o w-4"/> Profile
                </div>
                <div className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  onClick={handleLogout}>
                  <i className="fa fa-sign-out w-4"/> Logout
                </div>
              </div>
            </div>
          ) : (
            <button title="Login" onClick={() => setLoginModalOpen(true)}
              className="text-gray-700 hover:text-[#800000] transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </button>
          )}

          {/* Cart */}
          <button title="Cart" onClick={() => navigate('/cartcomponent')}
            className="relative text-gray-700 hover:text-[#800000] transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#800000] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Hamburger mobile */}
<button className="md:hidden text-gray-700 hover:text-[#800000]" onClick={() => setMobileOpen(true)}>            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── MEGA MENU ── */}
      {megaMenuCatId && (
        <div
          className="absolute left-0 right-0 bg-white z-40 border-t border-gray-100"
          style={{boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}
          onMouseEnter={() => clearTimeout(megaTimer.current)}
          onMouseLeave={closeMegaMenu}>

          {/* Category label bar */}
          <div className="bg-gray-50 border-b border-gray-100 px-8 py-2">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{activeCatName}</span>
          </div>

          {/* Columns grid */}
          <div className="px-8 py-6 min-h-[80px]">
            {megaLoading ? (
              <div className="flex gap-10">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3.5 bg-gray-200 rounded w-20"/>
                    <div className="h-2.5 bg-gray-100 rounded w-28"/>
                    <div className="h-2.5 bg-gray-100 rounded w-24"/>
                    <div className="h-2.5 bg-gray-100 rounded w-20"/>
                  </div>
                ))}
              </div>
            ) : megaData.length === 0 ? (
              <p className="text-sm text-gray-400">No subcategories found</p>
            ) : (
              <div className="flex flex-wrap gap-x-12 gap-y-4">
                {megaData.map(sub => (
                  <div key={sub.id} className="min-w-[130px]">
                    {/* Sub-category header — BOLD MAROON */}
                    <p
                      className="text-sm font-bold text-[#800000] capitalize mb-2 cursor-pointer hover:underline"
                      onClick={() => goToSubSub(sub.id)}>
                      {sub.title}
                    </p>





                    
                    {/* Sub-sub-category items */}
                    <ul className="space-y-1.5">
                      {(Array.isArray(sub.subSubCategories) ? sub.subSubCategories : []).slice(0, 8).map((ss, i) => (
                        <li key={i}>
                          <span
                            className="text-sm text-gray-600 cursor-pointer hover:text-[#800000] capitalize block transition-colors leading-snug"
                            onClick={() => goToSubSub(sub.id)}>
                            {ss.name || ss.title}
                          </span>
                        </li>
                      ))}
                    </ul>





                    <ul className="space-y-1.5">
  {Array.isArray(sub.subSubCategories) &&
    sub.subSubCategories.length > 0 ? (
      sub.subSubCategories.slice(0, 8).map((ss, i) => (
        <li key={i}>
          <span
            className="text-sm text-gray-600 cursor-pointer hover:text-[#800000] capitalize block"
            onClick={() => goToSubSub(sub.id)}
          >
            {ss.name || ss.title || "No Name"}
          </span>
        </li>
      ))
    ) : (
      <li className="text-xs text-gray-400">No items</li>
    )}
</ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="bg-black/50 flex-1" onClick={() => setMobileOpen(false)}/>
          <div className="bg-white w-80 h-full overflow-y-auto flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              {logoUrl ? <img src={logoUrl} alt="Kanchira" className="h-10 object-contain"/>
                : <span className="font-bold text-[#800000] text-lg">Kanchira</span>}
              <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-800 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center border border-gray-300 rounded px-3 py-2 gap-2 focus-within:border-[#800000]">
                <i className="fa fa-search text-gray-400 text-xs"/>
                <input type="text" value={searchTerm} onChange={e => filterSlugs(e.target.value)}
                  placeholder="Search products..." className="flex-1 text-sm outline-none"/>
              </div>
              {searchTerm && filteredSlugs.length > 0 && (
                <div className="mt-1 border border-gray-100 rounded max-h-40 overflow-y-auto">
                  {filteredSlugs.slice(0, 10).map(item => (
                    <div key={item._id}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer capitalize"
                      onClick={() => goToSubSub(item._id)}>{item.slug}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion */}
            <div className="flex-1 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat._id} className="border-b border-gray-100">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-gray-800 hover:text-[#800000] capitalize"
                    onClick={() => setMobileCatOpen(mobileCatOpen === cat._id ? null : cat._id)}>
                    {cat.name}
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${mobileCatOpen === cat._id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {mobileCatOpen === cat._id && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {subCategories.filter(s => s.categoryId === cat._id).map(sub => (
                        <div key={sub._id}>
                          <button
                            className="w-full flex items-center justify-between pl-6 pr-4 py-2.5 text-sm capitalize text-left"
                            onClick={() => expandMobileSub(sub._id)}>
                            <span className="font-semibold text-[#800000]">{sub.name}</span>
                            <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${mobileSubOpen === sub._id ? 'rotate-180' : ''}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                            </svg>
                          </button>
                          {mobileSubOpen === sub._id && (
                            <div className="pl-10 pb-2">
                              {(mobileSubData[sub._id] || []).length === 0
                                ? <p className="text-xs text-gray-400 py-1.5">No items</p>
                                : (mobileSubData[sub._id] || []).map((ss, i) => (
                                  <div key={i}
                                    className="py-1.5 text-sm text-gray-600 cursor-pointer hover:text-[#800000] capitalize"
                                    onClick={() => goToSubSub(sub._id)}>
                                    {ss.name || ss.title}
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-100 p-4 space-y-1">
              <button className="w-full flex items-center gap-3 py-2.5 text-sm text-gray-700 hover:text-[#800000]"
                onClick={() => { navigate('/wishlist'); setMobileOpen(false) }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                Wishlist {!isWishlistEmpty && `(${wishlist.length})`}
              </button>
              <button className="w-full flex items-center gap-3 py-2.5 text-sm text-gray-700 hover:text-[#800000]"
                onClick={() => { navigate('/cartcomponent'); setMobileOpen(false) }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
              {user ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium capitalize text-gray-700">Hi, {user.name?.split(' ')[0]}</span>
                  <button className="text-sm text-red-500 hover:text-red-700" onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <button
                  className="w-full bg-[#800000] text-white py-2.5 rounded text-sm font-semibold hover:opacity-90 mt-1"
                  onClick={() => { setLoginModalOpen(true); setMobileOpen(false) }}>
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}