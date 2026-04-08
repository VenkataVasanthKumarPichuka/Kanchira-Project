import axios from 'axios'

// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE_URL = 'https://kanchira-backend-fdlk.onrender.com/'

const api = axios.create({ baseURL: BASE_URL })

// ─── Auth / Users ────────────────────────────────────────────────────────────
export const userRegister = (data) => api.post('userRegister', data)
export const userLogin = (data) => api.post('userLogin', data)
export const verifyOtp = (data) => api.post('verifyOtp', data)
export const sentOtp = (data) => api.post('sentOtp', data)
export const sentVerifyOtp = (data) => api.post('sentVerifyOtp', data)
export const setPassword = (data) => api.post('setPassword', data)
export const resendOtp = (data) => api.post('resendOtp', data)
export const getUsers = () => api.get('users')
export const deleteUserById = (userId) => api.delete('deleteUserById', { data: { userId } })

// ─── Logo ─────────────────────────────────────────────────────────────────────
export const getLogo = () => api.get('getLogo')
export const updateLogo = (data) => api.put('updateLogo', data)

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = () => api.get('getCategories')
export const getCategoryById = (categoryId) => api.post('getCategoryById', { categoryId })

// ─── SubCategories ───────────────────────────────────────────────────────────
export const getSubCategories = () => api.get('getSubCategories')
export const getSubCategoryById = (subCategoryId) => api.post('getSubCategoryById', { subCategoryId })
export const getSub_SubCategories = () => api.get('getSub_SubCategories')
export const getSub_SubCategoryById = (subCategoryId) => api.post('getSub_SubCategoryById', { subCategoryId })

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts = () => api.get('getproducts')
export const getProductsBySubCategory = (subsubcategoryId) =>
  api.post('getProductsBySubCategory', { subsubcategoryId })
export const getProductsByIds = (data) => api.post('getProductsByIds', data)

// ─── Cart ─────────────────────────────────────────────────────────────────────
// export const addToCart = (data) => api.post('addcart', data)
export const getCart = (userId) => api.post('getcart', { userId })
export const getAllCartData = () => api.get('getAllCartData')

export const addToCart = (data) =>
  api.post('addcart', data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const addWishlist = (data) => api.post('addWishlist', data)

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const addReview = (data) => api.post('addReview', data)
export const getReview = (productId) => api.post('getReview', { productId })

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const getCoupons = () => api.get('getCoupons')
export const getCouponByCode = (code) => api.get(`getCouponByCode/${code}`)

// ─── Festival Discounts ───────────────────────────────────────────────────────
export const getFestival = () => api.get('getfestival')

// ─── Banners ─────────────────────────────────────────────────────────────────
export const getBanners = () => api.get('getBanners')

// ─── Payment ─────────────────────────────────────────────────────────────────
export const createPayment = (totalAmount) => api.post('createPayment', { totalAmount })

// ─── Pincode ─────────────────────────────────────────────────────────────────
export const getPincodes = () => api.get('getPincode')

// ─── Contact ─────────────────────────────────────────────────────────────────
export const submitContactForm = (data) => api.post('submitForm', data)

// ─── Address ─────────────────────────────────────────────────────────────────
export const addAddress = (data) => api.post('addAddress', data)
export const getAddressByUser = (userId) => api.post('getAddressByUser', { userId })

export default api
