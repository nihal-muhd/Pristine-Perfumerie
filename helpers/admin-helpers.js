var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports = {
    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Username: adminData.Username })
                if (admin) {
                    if (adminData.Password == admin.Password) {
                        console.log("login succcesful")
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login failed")
                        resolve({ status: false })
                    }
                } else {
                    console.log("login failed")
                    resolve({ status: false })
                }
            } catch (error) {
                reject(error)
            }

        })
    },
    blockUser: (userID) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userID) }, { $set: { Active: false } })
                resolve()
            } catch (error) {
                reject(error)
            }

        })
    },
    unblockUser: (userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userID) }, { $set: { Active: true } })
            } catch (error) {
                reject(error)
            }
        })
    },
    getUsers: () => {
        return new Promise((resolve, reject) => {
            try {
                let showUser = db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(showUser)
            } catch (error) {
                reject(error)
            }

        })
    },
    allReview: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let allReview = await db.get().collection(collection.REVIEW_COLLECTION).find().toArray()
                resolve(allReview)
            } catch (error) {
                reject(error)
            }
        })
    },
    addCategory: (catName) => {
        return new Promise(async (resolve, reject) => {
            try {
                let verifyCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ CategoryName: catName.CategoryName })
                if (verifyCat) {
                    resolve({ caterror: true })
                } else {
                    let data = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(catName)
                    resolve(data.insertedId)
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    viewCategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let catDetails = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(catDetails)
            } catch (error) {
                reject(error)
            }
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },
    addCoupon: (couponDetails) => {
        couponDetails.Value = parseInt(couponDetails.Value)
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails)
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    getCoupons: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(coupons)
            } catch (error) {
                reject(error)
            }

        })
    },
    getNewOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ "status": { $in: ["placed", "packed", "shipped"] } }).toArray()
                resolve(orders)
            } catch (error) {
                reject(error)
            }

        })
    },
    changedeliveryStatus: (orderId, value) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (value == "delivered") {
                    await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                        $set: {
                            status: value,
                            deliveryStatus: true
                        }
                    })
                    resolve({ updated: true })
                } else {
                    await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                        $set: {
                            status: value
                        }
                    })
                    resolve({ updated: true })
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    deleteCoupon: (couponID) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(couponID) })
                resolve({ status: true })
            } catch (error) {
                reject(error)
            }
        })
    },
    totalReport: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalRevenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$grandTotal" }
                        }
                    }
                ]).toArray()
                resolve(totalRevenue[0])
            } catch (error) {
                reject(error)
            }

        })
    },
    totalUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let usersCount = await db.get().collection(collection.USER_COLLECTION).find().count()
                resolve(usersCount)
            } catch (error) {
                reject(error)
            }
        })
    },
    orderReport: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let totalOrders = await db.get().collection(collection.ORDER_COLLECTION).find().count()
                resolve(totalOrders)
            } catch (error) {
                reject(error)
            }
        })
    },
    totalProduct: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let productReport = await db.get().collection(collection.PRODUCT_COLLECTION).find().count()
                resolve(productReport)
            } catch (error) {
                reject(error)
            }

        })
    },
    getTotalRevenue: () => {
        return new Promise(async (resolve, reject) => {
            let today = new Date()
            let before = new Date(new Date().getTime() - (250 * 24 * 60 * 60 * 1000))
            console.log(today, before, "gagagaggagagag")
            let revenue = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status: 'delivered',
                        date: {
                            $gte: before,
                            $lte: today
                        }
                    }
                },
                {
                    $project: {
                        paymentMethod: 1, grandTotal: 1, date: 1
                    }
                },
                {
                    $group: {
                        _id: { date: { $dateToString: { format: "%m-%Y", date: "$date" } }, paymentMethod: '$paymentMethod' },
                        Amount: { $sum: '$grandTotal' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id.date',
                        paymentMethod: '$_id.paymentMethod',
                        amount: '$Amount',
                    }
                }
            ]).sort({ date: 1 }).toArray()
            console.log(revenue, "blablbalb")
            let obj = {
                date: [], cod: [0, 0, 0, 0, 0, 0, 0, 0], online: [0, 0, 0, 0, 0, 0, 0, 0]
            }
            let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            let a = today.getMonth() - 6
            for (let i = 0; i < 8; i++) {
                for (let k = 0; k < revenue.length; k++) {
                    if (Number(revenue[k].date.slice(0, 2)) == Number(a + i)) {
                        if (revenue[k].paymentMethod == 'ONLINE') {
                            obj.online[i] = revenue[k].amount
                        } else {
                            obj.cod[i] = revenue[k].amount
                        }
                    }
                }
                obj.date[i] = month[a + i - 1]
            }
            resolve(obj)
        })
    }

}