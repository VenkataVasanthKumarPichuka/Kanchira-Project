import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getSubCategories } from '../services/api'

export default function Footer() {
  const { logoUrl, brandName, brandData } = useApp()
  const [subCategories, setSubCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getSubCategories().then(r => {
      const all = r.data?.SubCategories || r.data || []
      const shuffled = [...all].sort(() => 0.5 - Math.random()).slice(0, 15)
      setSubCategories(shuffled)
    }).catch(() => {})
  }, [])

  const goToSubSub = (id) => {
    localStorage.setItem('subCategoryId', id)
    navigate('/subsubcategory')
  }

  return (
    <footer className="footer">
      {/* Top Grid - Brand Left, Columns Right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Info - Takes 1 column */}
        <div className="md:col-span-1">
          {logoUrl && <img src={logoUrl} alt={brandName} className="max-h-14 mb-4 object-contain" />}
          <p className="text-[#666] text-[15px] leading-relaxed mb-4">Elegance in Every Drape,<br />Comfort in Every Stitch.</p>
          <div className="flex items-center gap-3">
            <img src="../../assets/images/original.png" alt="" className="w-12 h-12 object-contain" onError={e => e.target.style.display='none'} />
            <span className="text-[13px] text-[#666] leading-tight">ORIGINAL PRODUCTS guarantee<br />for all products at Kanchira.com</span>
          </div>
        </div>

        {/* Customer Policies */}
        <div className="md:col-span-1">
          <h4 className="text-[#222] text-[15px] font-semibold mb-4">Customer Policies</h4>
          <ul className="space-y-3">
            <li><Link to="/termsConditions" className="text-[#666] text-[14px] hover:text-[#800000]">T&amp;C</Link></li>
            <li><Link to="/shipping" className="text-[#666] text-[14px] hover:text-[#800000]">Shipping</Link></li>
            <li><Link to="/privacy_policy" className="text-[#666] text-[14px] hover:text-[#800000]">Privacy Policy</Link></li>
            <li><Link to="/cancellationsrefound" className="text-[#666] text-[14px] hover:text-[#800000]">Cancellation</Link></li>
            <li><Link to="/return-policy" className="text-[#666] text-[14px] hover:text-[#800000]">Returns</Link></li>
          </ul>
        </div>

        {/* Online Shopping */}
        <div className="md:col-span-1">
          <h4 className="text-[#222] text-[15px] font-semibold mb-4">Online Shopping</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-[#666] text-[14px] hover:text-[#800000]">Women</a></li>
            <li><a href="#" className="text-[#666] text-[14px] hover:text-[#800000]">Kids-boys</a></li>
            <li><a href="#" className="text-[#666] text-[14px] hover:text-[#800000]">Kids-girls <span className="text-[11px] bg-[#800000] text-white rounded px-2 py-0.5 ml-1">New</span></a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="md:col-span-1">
          <h4 className="text-[#222] text-[15px] font-semibold mb-4">Support</h4>
          <ul className="space-y-3">
            <li><Link to="/help-content" className="text-[#666] text-[14px] hover:text-[#800000]">Help Centre</Link></li>
            <li><Link to="/contactus" className="text-[#666] text-[14px] hover:text-[#800000]">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Popular Searches */}
      {subCategories.length > 0 && (
        <div className="border-t border-[#ddd] pt-5 mb-5">
          <h5 className="text-[#222] text-[15px] font-semibold mb-3">Popular Searches</h5>
          <div className="flex flex-wrap gap-x-2 gap-y-2 items-center">
            {subCategories.map((item, i) => (
              <span key={item._id} className="flex items-center">
                <span className="text-[#666] text-[13px] cursor-pointer hover:text-[#333] capitalize"
                  onClick={() => goToSubSub(item._id)}>
                  {item.name}
                </span>
                {i < subCategories.length - 1 && <span className="text-[#ccc] mx-2">|</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="border-t border-[#ddd] pt-5 mb-5">
        <h5 className="text-[#222] text-[15px] font-semibold mb-3">Registered Store/Office Address</h5>
        <p className="text-[#666] text-[14px] leading-7">
          {brandName} Clothing Store<br />
          No. 27, Venkateswara Nagar Main Road,<br />
          Near Anna Silks, T. Nagar,<br />
          Chennai – 600017, Tamil Nadu, India<br />
          📞 {brandData?.phoneNumber || '+91 9963353171'}<br />
          ✉️ {brandData?.email || 'kanchira.india@gmail.com'}
        </p>
      </div>

      {/* About */}
      <div className="border-t border-[#ddd] pt-5 mb-5">
        <h5 className="text-[#222] text-[15px] font-semibold mb-3 uppercase tracking-wide">ONLINE SHOPPING MADE EASY AT {brandName.toUpperCase()}</h5>
        <p className="text-[#777] text-[14px] leading-7 text-justify">
          Welcome to {brandName}, your go-to destination for elegant and affordable clothing for women and children in India.
          Our collection features timeless sarees, stylish kurtis, and delightful kidswear, all crafted to blend tradition with contemporary fashion.
        </p>
      </div>

      {/* Bottom */}
      <div className="border-t border-[#ddd] pt-5 flex items-center justify-between flex-wrap gap-4">
        <p className="text-[#666] text-[13px]">© KANCHIRA ENTERPRISES. All rights reserved.</p>
        <div className="flex gap-4 text-xl">
          <a href="#" className="text-[#333] hover:text-[#800000]"><i className="fa fa-facebook-square" /></a>
          <a href="#" className="text-[#333] hover:text-[#800000]"><i className="fa fa-instagram" /></a>
          <a href="#" className="text-[#333] hover:text-[#800000]"><i className="fa fa-twitter-square" /></a>
        </div>
      </div>
    </footer>
  )
}