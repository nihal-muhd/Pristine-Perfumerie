const userHelpers = require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers');
const categoryHelpers = require("../helpers/category-helpers");
const adminHelpers = require("../helpers/admin-helpers")
const cartHelpers = require('../helpers/cart-helpers')
const twilioHelpers = require('../helpers/twilio-helpers');
const { response } = require('../app');
const e = require('express');

let filteredProducts

module.exports = {
    SignUp: (req, res, next) => {
        try {
            if (req.session.signUpErr) {
                res.render("user/user-Signup", { user: true, signUpErr: req.session.errMessage });
                req.session.signUpErr = false
            } else {
                res.render('user/user-Signup', { user: true })
            }
        } catch (error) {
            console.log(error);
            next(error)
        }



    },
    postSignUp: async (req, res, next) => {
        try {
            let userVerify = await userHelpers.verifyUser(req.body.Email)
            if (userVerify.emailError) {
                req.session.signUpErr = true
                req.session.errMessage = "Email already exist"
                res.redirect('/signup')
            } else {
                let data = await twilioHelpers.doSms(req.body)
                req.session.body = req.body
                if (data) {
                    res.render('user/user-otp')
                } else {
                    res.redirect('/signup')
                }

            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    postOtp: async (req, res, next) => {
        try {
            let result = await twilioHelpers.otpVerify(req.body, req.session.body)
            if (result) {
                await userHelpers.doUserSignup(req.session.body)
                res.redirect('/login')
            } else {
                req.session.signUpErr = true
                req.session.errMessage = "The otp enterd is invalid! Pls try again"
                res.redirect('/signup')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }

    },

    Login: (req, res, next) => {
        try {
            if (req.session.loggedIn) {
                res.redirect('/')
            } else {
                res.render("user/user-Login", { user: true });
            }
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    postLogin: async (req, res, next) => {
        try {
            var response = await userHelpers.doUserLogin(req.body)
            if (response.status) {
                req.session.loggedIn = true
                req.session.user = response.user
                res.redirect('/')
            } else {
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    Home: async (req, res, next) => {
        try {
            var lim1 = 8
            var lim2 = 2
            var userDetails = req.session.user
            let cartCount = null
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            var proDetails = await productHelpers.getProduct(lim1)
            var exclusiveProduct = await productHelpers.getProduct(lim2)
            res.render("user/user-Home", { user: true, userDetails, proDetails, cartCount, exclusiveProduct });
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    menCategory: async (req, res, next) => {
        try {

            let productByCat = await userHelpers.getProductsCategory("Men")
            res.render('user/user-Category', { productByCat, user: true })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    womenCategory: async (req, res, next) => {
        try {
            let productByCat = await userHelpers.getProductsCategory("Women")
            res.render('user/user-Category', { productByCat, user: true })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    childrenCategory: async (req, res, next) => {
        try {
            let productByCat = await userHelpers.getProductsCategory("Children")
            res.render('user/user-Category', { productByCat, user: true })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    unisexCategory: async (req, res, next) => {
        try {
            let productByCat = await userHelpers.getProductsCategory("Unisex")
            res.render('user/user-Category', { productByCat, user: true })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    Profile: async (req, res, next) => {
        try {
            var userDetails = req.session.user
            if (userDetails) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
                let user = await userHelpers.getUserDetails(req.params.id)
                res.render('user/user-Profile', { user: true, userDetails, user, cartCount })
            } else {
                res.redirect('/')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    shopPage: async (req, res, next) => {
        try {
            var userDetails = req.session.user
            catDetails = await adminHelpers.viewCategory()
            let cartCount = null
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            res.render('user/user-ShopPage', { user: true, product: filteredProducts, catDetails, userDetails, cartCount })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    shopAll: async (req, res, next) => {
        try {
            var product = await productHelpers.getProduct()
            filteredProducts = product
            res.redirect('/shop')
        } catch (error) {
            next(error)
        }

    },
    searchProduct: async (req, res, next) => {
        try {
            let key = req.body.key;
            filteredProducts = await userHelpers.searchProducts(key)
            res.redirect('/shop')
        } catch (error) {
            next(error)
        }

    },
    productFilter: async (req, res) => {
        try {
            let detail = req.body
            let price = parseInt(detail.price)
            let filter = []
            for (let i of detail.categoryName) {
                filter.push({ 'Category': i })
            }
            let response = await userHelpers.filterProduct(filter, price)
            filteredProducts = response

            if (detail.sort == 'Sort') {
                res.json({ status: true })
            }
            if (detail.sort == 'lh') {
                filteredProducts.sort((a, b) => { return a.Price - b.Price });
                res.json({ status: true })
            }
            if (detail.sort == 'hl') {
                filteredProducts.sort((a, b) => { return b.Price - a.Price });
                res.json({ status: true })
            }
            if (detail.sort == 'az') {
                filteredProducts.sort(function (a, b) {
                    return (a.Bname < b.Bname) ? -1 : (a.Bname > b.Bname) ? 1 : 0;
                });
                res.json({ status: true })
            }
            if (detail.sort == 'za') {
                filteredProducts.sort(function (a, b) {
                    return (a.Bname > b.Bname) ? -1 : (a.Bname < b.Bname) ? 1 : 0;
                });
                res.json({ status: true });
            }
        } catch (error) {
            next(error)
        }
    },
    productDetail: async (req, res, next) => {
        try {
            var userDetails = req.session.user
            var id = req.params.id
            let cartCount = null
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            var reviews = await userHelpers.viewReview(id)
            var proDetails = await productHelpers.productDetails(id)
            res.render('user/user-SingleProduct', { user: true, proDetails, userDetails, reviews, cartCount })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    postReview: (req, res, next) => {
        try {
            let reviewDetails = {
                Email: req.session.user.Email,
                Name: req.session.user.Name,
                ProId: req.params.id,
                Review: req.body.Review,
            }
            userHelpers.addReview(reviewDetails)
            res.redirect('/product-details/' + req.params.id)
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    getCart: async (req, res, next) => {
        try {
            var userDetails = req.session.user
            let cartCount = null
            if (userDetails) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
                let Total = await cartHelpers.getTotalAmount(userDetails._id)
                let products = await cartHelpers.getCartProducts(req.session.user._id)
                res.render('user/user-Cart', { user: true, products, userDetails, cartCount, Total })
            } else {
                cartCount = null
                res.redirect('/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    addToCart: async (req, res, next) => {
        try {
            await cartHelpers.addToCart(req.params.id, req.session.user._id)
            res.json({ status: true })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    changeQuantity: (req, res, next) => {
        cartHelpers.changeProductQuantity(req.body).then(async (response) => {
            try {
                response.productTotal = await cartHelpers.getProductTotal(req.body.user, req.body.product)
                response.total = await cartHelpers.getTotalAmount(req.body.user)
                res.json(response)
            } catch (error) {
                console.log(error);
                next(error)
            }
        })
    },
    deleteCartProduct: async (req, res, next) => {
        try {
            cartId = req.params.cartId
            proId = req.params.proId
            let response = await cartHelpers.deleteCartProduct(cartId, proId)
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    Wishlist: async (req, res, next) => {
        try {
            var userDetails = req.session.user
            cartCount = await cartHelpers.getCartCount(userDetails._id)
            products = await userHelpers.getWishlistProducts(userDetails._id)
            res.render('user/user-Wishlist', { user: true, userDetails, cartCount, products })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    addToWishlist: async (req, res, next) => {
        try {
            let response = await userHelpers.addToWishlist(req.session.user._id, req.params.id)
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    deleteWishlist: async (req, res, next) => {
        try {
            cartId = req.params.cartId
            proId = req.params.proId
            let response = await userHelpers.deleteWishlistProduct(cartId, proId)
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    placeOrder: async (req, res, next) => {
        try {
            userDetails = req.session.user
            let userData = await userHelpers.getUserDetails(userDetails._id)
            let Total = await cartHelpers.getTotalAmount(req.session.user._id)
            let products = await cartHelpers.getCartProducts(userDetails._id)
            let cartCount = null
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            res.render('user/user-Checkout', { user: true, Total, userDetails, products, userData, cartCount })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    postPlaceOrder: async (req, res, next) => {
        try {
            let grandTotal = req.body.grandTotal
            let products = await cartHelpers.getCartProductList(req.body.userId)
            let totalPrice = await cartHelpers.getTotalAmount(req.body.userId)
            let couponName = req.session.CouponName
            let orderId = await userHelpers.placeOrder(req.body, products, totalPrice, couponName)
            if (req.body.Payment_method == 'COD') {
                res.json({ codSuccess: true })
            } else {
                let response = await userHelpers.generateRazorPay(orderId, grandTotal)
                res.json(response)
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    postVerfyPayment: (req, res) => {
        userHelpers.verifyPayment(req.body).then(() => {
            userHelpers.changeProductStatus(req.body['order[receipt]']).then(() => {
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false, errMsg: '' })
        })
    },
    orderSuccess: async (req, res, next) => {
        try {
            userDetails = req.session.user
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            res.render('user/user-OrderSucess', {user:true, userDetails, cartCount })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    completeOrders: async (req, res, next) => {
        try {
            userDetails = req.session.user
            let orders = await userHelpers.getUserOrder(req.session.user._id)
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            res.render('user/user-Orders', { user: true, userDetails, orders, cartCount })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    viewOrderedProduct: async (req, res, next) => {
        try {
            userDetails = req.session.user
            let products = await userHelpers.getOrderProducts(req.params.id)
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            res.render('user/user-OrderedProduct', { user: true, products, cartCount,userDetails })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    applyCoupon: async (req, res, next) => {
        try {
            let response = await userHelpers.applyCoupon(req.body.couponName, req.body.userId)
            if (response.CouponName) {
                req.session.CouponName = response.CouponName
            }
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    cancelOrder: async (req, res, next) => {
        try {
            await userHelpers.cancelOrder(req.params.id)
            res.redirect('/orders')
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    returnOrder: async (req, res, next) => {
        try {
            await userHelpers.returnOrder(req.params.id)
            res.redirect('/orders')
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    invoice: async (req, res, next) => {
        try {
            let products = await userHelpers.getOrderProducts(req.params.id)
            let order = await userHelpers.getSingleOrder(req.params.id)
            res.render('user/user-Invoice', { products, order })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    contact: async (req, res, next) => {
        try {
            userDetails = req.session.user
            if (req.session.user) {
                cartCount = await cartHelpers.getCartCount(userDetails._id)
            }
            res.render('user/user-Contact', { user: true, userDetails, cartCount })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    editProfile: async (req, res, next) => {
        try {
            await userHelpers.updateUserProfile(req.params.id, req.body)
            res.redirect('/view-profile/' + req.params.id)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    addAddress: async (req, res, next) => {
        try {
            await userHelpers.addAddress(req.params.id, req.body)
            res.redirect('/view-profile/' + req.params.id)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    deleteAddress: (req, res, next) => {
        try {
            userId = req.params.userId
            addId = req.params.addId
            userHelpers.deleteAddress(userId, addId)
            res.redirect('/view-profile/' + req.params.userId)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    getEditAddress: async (req, res, next) => {
        try {
            let response = await userHelpers.getAddress(req.body.userId, req.body.addressId)
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    postAddress: async (req, res, next) => {
        try {
            var userId = req.body.userId
            var addId = req.body.addressId
            let response = await userHelpers.editAddress(userId, addId, req.body)
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    logout: (req, res) => {
        try {
            req.session.loggedIn = false
            req.session.user = null
            res.redirect('/')
        } catch (error) {
            console.log(error);
            next(error)
        }

    }


}