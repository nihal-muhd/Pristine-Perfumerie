var express = require('express');
const { response, } = require('../app');
var router = express.Router();
const adminController = require('../controllers/adminControllers')
const adminHelpers = require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const multer = require('multer')


/* For Product Images  */
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/admin/product-Images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname)
  }
})

const upload = multer({ storage: fileStorageEngine })

/* For Admin Session  */
const verifyAdmin = ((req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
})

/* For Login  */
router.get('/login', adminController.adminLogin)
router.post('/login', adminController.adminPostLogin)

/* For Home-Page  */
router.get('/', verifyAdmin, adminController.adminHomePage)
router.post('/total-revenue', adminController.TotalRevenueGraph)

/* For Product */
router.get('/add-product', verifyAdmin, adminController.adminAddProduct)
router.post('/add-product', upload.array('Image', 3), verifyAdmin, adminController.adminPostProduct)
router.get('/all-product', verifyAdmin, adminController.adminGetAllProduct)
router.get('/product-View-More/:id', verifyAdmin, adminController.adminProductViewMore)
router.get('/delete-product/:id', verifyAdmin, adminController.adminDeleteProduct)
router.get('/edit-product/:id', verifyAdmin, adminController.adminEditProduct)
router.post('/edit-product/:id', upload.array('Image', 3), verifyAdmin, adminController.adminPostEdit)

/* For Users. */
router.get('/user-list', verifyAdmin, adminController.adminUserList)
router.get('/block-user/:id', verifyAdmin, adminController.adminBlockUser)
router.get('/unblock-user/:id', verifyAdmin, adminController.adminUnBlockUser)

/* For Add-Category */
router.get('/category', verifyAdmin, adminController.adminCategory)
router.post('/category', verifyAdmin, adminController.adminPostCategory)

/* For Review. */
router.get('/user-review', verifyAdmin, adminController.adminViewReview)

/* For Orders */
router.get('/order-list', verifyAdmin, adminController.orderList)
router.get('/ordered-products/:id', verifyAdmin, adminController.orderedProducts)
router.get('/order-received', verifyAdmin, adminController.orderReceived)
router.post('/change-delivery-status', verifyAdmin, adminController.postDeliveryStatus)

/* For Coupon */
router.get('/coupon', verifyAdmin, adminController.coupon)
router.post('/coupon', verifyAdmin, adminController.postCoupon)
router.get('/delete-coupon/:id', verifyAdmin, adminController.deleteCoupon)

/* For Logout */
router.get('/logout', adminController.logout)

/* For Admin Error Page */
router.use(function (req, res, next) {
  next(createError(404));
});

router.use(function (err, req, res, next) {
  console.log("admin error route handler")
  res.status(err.status || 500);
  res.render('admin/admin-error', { layout: 'admin-layout' });
});


module.exports = router;
