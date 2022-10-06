var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { disable, response } = require('../app')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { resolve } = require('path')

var instance = new Razorpay({
    key_id: process.env.RAZOR_PAY_KEY_ID,
    key_secret: process.env.RAZOR_PAY_KEY_SECRET,
});


module.exports = {
    doUserSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                userData.Password = await bcrypt.hash(userData.Password, 10)
                userData.confirmPassword = await bcrypt.hash(userData.confirmPassword, 10)
                userData.Active = true
                let data = await db.get().collection(collection.USER_COLLECTION).insertOne(userData)
                resolve(data.insertedId)
            } catch (error) {
                reject(error)
            }
        })
    },
    verifyUser: (userEmail) => {
        return new Promise(async (resolve, reject) => {
            try {
                let verify = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userEmail })
                if (verify == null) {
                    resolve({ emailError: false })
                } else {

                    resolve({ emailError: true })
                }
            } catch (error) {
                reject(error)
            }


        })
    },
    doUserLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
                if (user) {
                    bcrypt.compare(userData.Password, user.Password).then((status) => {
                        if (status && user.Active) {
                            console.log("Login successful")
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("Login failed")
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log("Login failed")
                    resolve({ status: false })
                }
            } catch (error) {
                reject(error)
            }

        })
    },
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                resolve(userData)
            } catch (error) {
                reject(error)
            }
        })
    },
    updateUserProfile: (userId, userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                    $set: {
                        Name: userData.Name
                    }
                })
                resolve(response)
            } catch (error) {
                reject(error)
            }

        })

    },
    addAddress: (userId, addressData) => {
        create_random_id(15)
        function create_random_id(string_Length) {
            var randomString = ''
            var numbers = '1234567890'
            for (var i = 0; i < string_Length; i++) {
                randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
            }
            addressData._addId = "ADD" + randomString
        }
        let subAddress = {
            _addId: addressData._addId,
            Name: addressData.Name,
            Phone: addressData.Phone,
            Building_Name: addressData.Building_Name,
            Street_Name: addressData.Street_Name,
            City: addressData.City,
            District: addressData.District,
            State: addressData.State,
            Pincode: addressData.Pincode
        }
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                if (user.Addresses) {
                    if (user.Addresses.length < 4) {
                        await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                            $push: { Addresses: subAddress }
                        })
                        resolve()
                    } else {
                        resolve({ full: true })
                    }
                } else {
                    Addresses = [subAddress]
                    await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Addresses } })
                    resolve()
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    deleteAddress: (userId, addId) => {
        return new Promise(async (reject, resolve) => {
            try {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                    $pull: { Addresses: { _addId: addId } }
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getAddress: (userId, addId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: {
                            _id: objectId(userId)
                        }
                    },
                    {
                        $unwind: '$Addresses'
                    },
                    {
                        $project: { Addresses: 1 }
                    },
                    {
                        $match: { 'Addresses._addId': addId }

                    }
                ]).toArray()
                resolve(address[0])
            } catch (error) {
                reject(error)
            }
        })
    },
    editAddress: (userId, addId, addData) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId), "Addresses._addId": addId }, {
                    $set: {
                        "Addresses.$.Name": addData.Name,
                        "Addresses.$.Phone": addData.Phone,
                        "Addresses.$.Building_Name": addData.Building_Name,
                        "Addresses.$.Street_Name": addData.Street_Name,
                        "Addresses.$.City": addData.City,
                        "Addresses.$.District": addData.District,
                        "Addresses.$.State": addData.State,
                        "Addresses.$.Pincode": addData.Pincode
                    }
                })
                resolve({ status: true })
            } catch (error) {
                reject(error)
            }

        })
    },
    addReview: (reviewDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.REVIEW_COLLECTION).insertOne(reviewDetails)
                resolve()
            } catch (error) {
                reject(error)
            }

        })
    },
    viewReview: (proId) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.REVIEW_COLLECTION).find({ ProId: proId }).toArray()
            resolve(data)
        })
    },
    addToWishlist: (userId, proId) => {
        let productObj = {
            item: objectId(proId)
        }
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (user) {
                let proExist = user.products.findIndex(product => product.item == proId)
                console.log(proExist, "bbaaa");
                if (proExist != -1) {
                    resolve({ Exist: true })
                } else {
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) }, {
                        $push: { products: productObj }
                    }).then(() => {
                        resolve({ status: true })
                    })
                }
            } else {
                wishObj = {
                    user: objectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then((response) => {
                    resolve({ status: true })
                })
            }
        })
    },
    getWishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: { item: '$products.item' }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: { item: 1, product: { $arrayElemAt: ['$product', 0] } }
                    }

                ]).toArray()
                resolve(wishlist)
            } catch (error) {
                reject(error)
            }

        })

    },
    deleteWishlistProduct: (cartId, proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ _id: objectId(cartId) },
                    {
                        $pull: { products: { item: objectId(proId) } }
                    }
                )
                resolve({ removeProduct: true })

            } catch (error) {
                reject(error)
            }

        })
    },
    placeOrder: (order, products, total, couponName) => {
        return new Promise(async (resolve, reject) => {
            try {
                let status = order.Payment_method === 'COD' ? 'placed' : 'pending'
                let orderObj = {
                    deliveryDetails: {
                        mobile: order.Phone,
                        buildingName: order.Buidling_Name,
                        streetName: order.Street_Name,
                        city: order.City,
                        pincode: order.Pincode
                    },
                    userId: objectId(order.userId),
                    paymentMethod: order.Payment_method,
                    products: products,
                    totalAmount: total,
                    discount: parseInt(order.discount),
                    grandTotal: parseInt(order.grandTotal),
                    status: status,
                    date: new Date()
                }
                let users = [order.userId]
                await db.get().collection(collection.COUPON_COLLECTION).updateOne({ CouponName: couponName }, {
                    $set: { users }
                })
                let data = await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)
                await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                resolve(data.insertedId)
            } catch (error) {
                reject(error)
            }
        })
    },
    generateRazorPay: (orderId, grandTotal) => {
        return new Promise((resolve, reject) => {
            try {
                var options = {
                    amount: grandTotal * 100,
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(order)
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { userId: objectId(userId) }
                    },
                    {
                        
                        $project:{
                            deliveryDetails:1,userId:1,paymentMethod:1,products:1,totalAmount:1,discount:1,grandTotal:1,status:1,date: { $dateToString: { format: "%d-%m-%Y", date: "$date" } }
                        }
                    }
                ]).sort({date:-1}).toArray()
                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderProduct = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, proTotal: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                        }
                    }

                ]).toArray()
                resolve(orderProduct)
            } catch (error) {
                reject(error)
            }

        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', process.env.RAZOR_PAY_KEY_SECRET)
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changeProductStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: 'placed'
                }
            }).then(() => {
                resolve()
            })
        })
    },
    applyCoupon: (couponName, userId) => {
        let usersId = objectId(userId)
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.COUPON_COLLECTION).findOne({ CouponName: couponName })
                if (result) {
                    var d = new Date()
                    let str = d.toJSON().slice(0, 10)
                    if (str >= result.Expiry_Date) {
                        resolve({ expired: true })
                    } else {
                        let user = await db.get().collection(collection.COUPON_COLLECTION).findOne({ CouponName: couponName, users: { $in: [objectId(userId)] } })
                        if (user) {
                            resolve({ used: true })
                        } else {
                            resolve(result)
                        }
                    }
                } else {
                    resolve({ notAvailable: true })
                }
            } catch (error) {
                reject(error)
            }

        })
    },
    cancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        status: 'cancelled',
                        cancelStatus: true
                    }
                })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    returnOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        status: 'returned',
                        returnStatus: true,
                        deliveryStatus: false
                    }
                })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    getSingleOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
                resolve(order)
            } catch (error) {
                reject(error)
            }

        })
    },
    getProductsCategory: (catName) => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ "Category": catName }).toArray()
                console.log(products, "nlalanakjd");
                resolve(products)
            } catch (error) {
                reject(error)
            }
        })
    },
    searchProducts: (key) => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                    $or: [
                        {
                            Bname: { $regex: key, $options: "i" }
                        },
                        {
                            Category: { $regex: key, $options: "i" }
                        }
                    ]
                }).toArray()
                resolve(products)
            } catch (error) {
                reject(error)
            }
        })
    },
    filterProduct: (filter, price) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (filter.length > 1) {
                    var Products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                        {
                            $match: {
                                $or: filter
                            },
                        },
                        {
                            $match: {
                                Price: { $lt: price }
                            }
                        }
                    ]).toArray()
                    resolve(Products)
                } else {
                    console.log("trueee")
                    var products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                        {
                            $match: {
                                Price: { $lt: price }
                            }
                        }
                    ]).toArray()
                    resolve(products)
                }
            } catch (error) {
                reject(error)
            }
        })
    }


}

