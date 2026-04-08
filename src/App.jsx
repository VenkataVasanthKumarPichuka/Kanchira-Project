import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoginModal from './components/auth/LoginModal'
import { useApp } from './context/AppContext'

import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import SubCategory from './pages/SubCategory'
import SubSubCategory from './pages/SubSubCategory'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import OtpVerifyPage from './pages/OtpVerifyPage'
import { ForgetPasswordPage, PasswordVerifyPage, RegisterPage } from './pages/AuthPages'
import DiscountSpinPage from './pages/DiscountSpinPage'
import AllReviewsPage from './pages/AllReviewsPage'
import { PaymentCallbackPage, BuynowPage } from './pages/PaymentPages'
import {
  HelpCenterPage, TermsConditionsPage, ShippingPolicyPage,
  PrivacyPolicyPage, CancellationReturnsPage, ReturnPolicyPage, ContactUsPage
} from './pages/PolicyPages'

export default function App() {
  const { loginModalOpen, setLoginModalOpen } = useApp()
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="bottom-center" toastOptions={{ style: { fontSize: 13 } }} />
      <Navbar />
      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/product-details/:id" element={<ProductDetails />} />
        <Route path="/product-details/:id/:slug" element={<ProductDetails />} />
        <Route path="/subcategory/:categoryId" element={<SubCategory />} />
        <Route path="/subsubcategory" element={<SubSubCategory />} />
        <Route path="/subsubcategory/:id" element={<SubSubCategory />} />
        <Route path="/cartcomponent" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/OTP-verify" element={<OtpVerifyPage />} />
        <Route path="/forgotpassword" element={<ForgetPasswordPage />} />
        <Route path="/password-verify-password" element={<PasswordVerifyPage />} />
        <Route path="/spinner" element={<DiscountSpinPage />} />
        <Route path="/all-reviews/:id" element={<AllReviewsPage />} />
        <Route path="/payment_callback" element={<PaymentCallbackPage />} />
        <Route path="/buynow" element={<BuynowPage />} />
        <Route path="/help-content" element={<HelpCenterPage />} />
        <Route path="/termsConditions" element={<TermsConditionsPage />} />
        <Route path="/shipping" element={<ShippingPolicyPage />} />
        <Route path="/privacy_policy" element={<PrivacyPolicyPage />} />
        <Route path="/cancellationsrefound" element={<CancellationReturnsPage />} />
        <Route path="/return-policy" element={<ReturnPolicyPage />} />
        <Route path="/contactus" element={<ContactUsPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
