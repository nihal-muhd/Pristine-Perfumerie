const productHelpers = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const categoryHelpers = require('../helpers/category-helpers')
const fs = require('fs')
const path = require('path');

let adminlogin = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
}

module.exports = {
    adminLogin: (req, res, next) => {
        try {
            if (req.session.admin) {
                res.redirect('/admin')
            } else {
                res.render('admin/admin-Login', { layout: 'admin-layout' });
            }
        } catch (error) {
            console.log("Error loading login page of admin")
            next(error)
        }

    },
    adminPostLogin: async (req, res, next) => {
        try {
            let data = req.body
            if (data.Username == adminlogin.username) {
                if (data.Password == adminlogin.password) {
                    req.session.adminLoggedIn = true
                    req.session.admin = data
                    res.redirect('/admin')
                } else {
                    res.redirect('/admin/login')
                }
            } else {
                res.redirect('/admin/login')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminHomePage: async (req, res, next) => {
        try {
            let totalRevenue = await adminHelpers.totalReport()
            let totalUsers = await adminHelpers.totalUsers()
            let ordersTotal = await adminHelpers.orderReport()
            let productTotal = await adminHelpers.totalProduct()
            var adminDetails = req.session.admin
            res.render('admin/admin-Home', { layout: 'admin-layout', admin: true, adminDetails, totalRevenue, totalUsers, ordersTotal, productTotal });
        } catch (error) {
            console.log(error)
            next(error)
        }

    },
    TotalRevenueGraph: async (req, res) => {
        try {
            let response = await adminHelpers.getTotalRevenue()
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }

    },
    orderCount: async (req, res) => {
        try {
            let response = await adminHelpers.ordersCount()
            res.json(response)
        } catch (error) {
            console.log(error)
            next(error)
        }
    },
    adminAddProduct: async (req, res, next) => {
        try {
            var catDetails = await adminHelpers.viewCategory()
            res.render('admin/admin-Add-product', { layout: 'admin-layout', admin: true, catDetails });
        } catch (error) {
            console.log(error)
            next(error)
        }

    },
    adminPostProduct: async (req, res, next) => {
        try {
            const Images = []
            for (i = 0; i < req.files.length; i++) {
                Images[i] = req.files[i].filename
            }
            req.body.Image = Images
            await productHelpers.addProduct(req.body)
            res.redirect('/admin/add-product')
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminGetAllProduct: async (req, res, next) => {
        try {
            var product = await productHelpers.getProduct()
            res.render('admin/admin-All-product', { layout: 'admin-layout', admin: true, product });
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminDeleteProduct: (req, res, next) => {
        try {
            let proId = req.params.id
            var imgDel = productHelpers.deleteProduct(proId)
            console.log(imgDel);
            if (imgDel) {
                for (i = 0; i < imgDel.length; i++) {
                    var imagePath = path.join(__dirname, '../public/admin/product-Images/' + imgDel[i])
                    fs.unlink(imagePath, (err) => {
                        if (err)
                            return
                    })
                }
            }
            res.redirect('/admin/all-product')
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminEditProduct: async (req, res, next) => {
        try {
            let proDetails = await productHelpers.productDetails(req.params.id)
            var catDetails = await adminHelpers.viewCategory()
            for (let i = 0; i < catDetails.length; i++) {
                if (proDetails.Category == catDetails[i].CategoryName) {
                    catDetails[i].flag = true
                }
            }
            res.render('admin/admin-Edit-product', { proDetails, catDetails, layout: 'admin-layout' })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    adminPostEdit: async (req, res, next) => {
        try {
            let id = req.params.id
            const editImg = []
            for (i = 0; i < req.files.length; i++) {
                editImg[i] = req.files[i].filename
            }
            req.body.Image = editImg
            var oldImage = await productHelpers.productUpdate(id, req.body)
            if (oldImage) {
                for (i = 0; i < oldImage.length; i++) {
                    var oldImagePath = path.join(__dirname, '../public/admin/product-Images/' + oldImage[i])
                    fs.unlink(oldImagePath, function (err) {
                        if (err)
                            return
                    })
                }
            }
            res.redirect('/admin/all-product')
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminProductViewMore: async (req, res, next) => {
        try {
            id = req.params.id
            proDetails = await productHelpers.productDetails(id)
            catDetails = await adminHelpers.viewCategory()
            res.render('admin/admin-ViewMore-product', { proDetails, catDetails })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminUserList: async (req, res, next) => {
        try {
            var showUser = await adminHelpers.getUsers()
            res.render('admin/admin-User-list', { layout: 'admin-layout', admin: true, showUser })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminBlockUser: async (req, res, next) => {
        try {
            var userID = req.params.id
            await adminHelpers.blockUser(userID)
            res.redirect('/admin/user-list')
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    adminUnBlockUser: (req, res, next) => {
        try {
            var userID = req.params.id
            adminHelpers.unblockUser(userID)
            res.redirect('/admin/user-list')
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminCategory: async (req, res, next) => {
        try {
            if (req.session.catError) {
                var catDetails = await adminHelpers.viewCategory()
                res.render('admin/admin-Category', { layout: 'admin-layout', admin: true, catDetails, catError: req.session.catError })
                req.session.catError = false
            } else {
                var catDetails = await adminHelpers.viewCategory()
                res.render('admin/admin-Category', { layout: 'admin-layout', catDetails, admin: true, })
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    adminPostCategory: async (req, res, next) => {
        try {
            let response = await adminHelpers.addCategory(req.body)
            if (response.caterror) {
                req.session.catError = "Category already exist"
                res.redirect('/admin/category')
            } else {
                res.redirect('/admin/category')
            }
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    adminViewReview: async (req, res, next) => {
        try {
            var reviews = await adminHelpers.allReview()
            res.render('admin/admin-User-reviews', { layout: 'admin-layout', admin: true, reviews })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    orderList: async (req, res, next) => {
        try {
            let allOrders = await adminHelpers.getAllOrders()
            res.render('admin/admin-Order-list', { layout: 'admin-layout', admin: true, allOrders })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    orderedProducts: async (req, res, next) => {
        try {
            let products = await userHelpers.getOrderProducts(req.params.id)
            res.render('admin/admin-Ordered-Product', { layout: 'admin-layout', admin: true, products })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },
    coupon: async (req, res, next) => {
        try {
            let coupons = await adminHelpers.getCoupons()
            res.render('admin/admin-Coupon', { layout: 'admin-layout', admin: true, coupons })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    postCoupon: async (req, res, next) => {
        try {
            await adminHelpers.addCoupon(req.body)
            res.redirect('/admin/coupon')
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    orderReceived: async (req, res) => {
        try {
            let newOrders = await adminHelpers.getNewOrders()
            res.render('admin/admin-Order-Received', { layout: 'admin-layout', admin: true, newOrders })
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    postDeliveryStatus: async (req, res) => {
        try {
            orderId = req.body.orderId
            deliveryStatus = req.body.delstatus
            let response = await adminHelpers.changedeliveryStatus(orderId, deliveryStatus)
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    deleteCoupon: async (req, res) => {
        try {
            let response = await adminHelpers.deleteCoupon(req.params.id)
            res.json(response)
        } catch (error) {
            console.log(error);
            next(error)
        }
    },
    logout: (req, res) => {
        try {
            req.session.adminLoggedIn = false
            req.session.admin = null
            res.redirect('/admin/login')
        } catch (error) {
            console.log(error);
            next(error)
        }

    }

}