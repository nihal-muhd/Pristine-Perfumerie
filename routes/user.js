const { response } = require("express");
var express = require("express");
var router = express.Router();
const userController = require('../controllers/userControllers');
const userHelpers = require('../helpers/user-helpers')

const verifyUser = (async (req, res, next) => {
  if (req.session.user) {
    let user = await userHelpers.getUserDetails(req.session.user._id)
    if (user.Active) {
      next()
    } else {
      req.session.loggedIn = false
      req.session.user = null
      res.redirect('/login')
    }
  } else {
    res.redirect('/login')
  }
})

/* For Home-Page */
router.get('/', userController.Home)

/* For Home-Page Category */
router.get('/womenCategory', userController.womenCategory)
router.get('/menCategory', userController.menCategory)
router.get('/childrenCategory', userController.childrenCategory)
router.get('/allCategory', userController.unisexCategory)

/* For Login */
router.get('/login', userController.Login)
router.post('/login', userController.postLogin)

/* For Signup */
router.get('/signup', userController.SignUp)
router.post('/signup', userController.postSignUp)

/* For OTP */
router.post('/otp', userController.postOtp)

/* For Profile */
router.get('/view-profile/:id', verifyUser, userController.Profile)
router.post('/edit-profile/:id', verifyUser, userController.editProfile)

/* For Address */
router.post('/add-address/:id', verifyUser, userController.addAddress)
router.get('/delete-address/:userId/:addId', verifyUser, userController.deleteAddress)
router.post('/get-edit-address', verifyUser, userController.getEditAddress)
router.post('/post-edit-address', verifyUser, userController.postAddress)

/* For Shop-Page */
router.get('/shop', userController.shopPage)

/* For Filter-Products */
router.get('/shopAll', userController.shopAll)
router.post('/product-filter', userController.productFilter)

/* For Search-Products */
router.post('/search-products', userController.searchProduct)

/* For Product-View-More */
router.get('/product-details/:id', userController.productDetail)

/* For Posting-Review */
router.post('/product-review/:id', userController.postReview)

/* For Cart */
router.get('/cart', verifyUser, userController.getCart)
router.get('/add-to-cart/:id', verifyUser, userController.addToCart)
router.post('/change-product-quantity', verifyUser, userController.changeQuantity)
router.get('/cart-delete-product/:cartId/:proId', verifyUser, userController.deleteCartProduct)

/* For Wishlist */
router.get('/wishlist', verifyUser, userController.Wishlist)
router.get('/addToWishlist/:id', verifyUser, userController.addToWishlist)
router.get('/wishlist-delete-product/:cartId/:proId', verifyUser, userController.deleteWishlist)

/* For Checkout */
router.get('/place-order', verifyUser, userController.placeOrder)
router.post('/place-order', verifyUser, userController.postPlaceOrder)
router.post('/verify-payment', verifyUser, userController.postVerfyPayment)
router.post('/apply-coupon', userController.applyCoupon)

/* For OrderSuccess */
router.get('/order-success', verifyUser, userController.orderSuccess)

/* For Orders */
router.get('/orders', verifyUser, userController.completeOrders)
router.get('/view-order-produts/:id', verifyUser, userController.viewOrderedProduct)
router.get('/cancel-order/:id', userController.cancelOrder)
router.get('/return-order/:id', userController.returnOrder)
router.get('/invoice/:id', verifyUser, userController.invoice)

/* For Contact */
router.get('/contact', userController.contact)

/* For Logout */
router.get('/logout',userController.logout)



module.exports = router;
