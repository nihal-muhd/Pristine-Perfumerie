var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports = {
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (userCart) {
                    let proExist = userCart.products.findIndex(product => product.item == proId)
                    if (proExist != -1) {
                        await db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            })
                        resolve()
                    } else {
                        await db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }
                        )
                        resolve()
                    }
                } else {
                    let cartObj = {
                        user: objectId(userId),
                        products: [proObj]
                    }
                    await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj)
                    resolve()
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
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
                    // $lookup: {  // $lookup means joining two collections
                    //     from: collection.PRODUCT_COLLECTION,  // from means, the collection that we need to join
                    //     let: { 'cartProList': '$products' },// let is used because the products key in cart collection is an array. So we are taking the values into cartProList
                    //     pipeline: [{  // Using pipeline if we are using $match stage it is required to use $expr. In that we can use comparison operators
                    //         $match: {
                    //             $expr: {
                    //                 $in: ['$_id', '$$cartProList']
                    //             }
                    //         }
                    //     }],
                    //     as: 'cartItems' // as is used to store the datas after these process
                    // }

                ]).toArray()
                resolve(cartItems)
            } catch (error) {
                reject(error)
            }

        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (cart) {
                    count = cart.products.length
                }
                resolve(count)
            } catch (error) {
                reject(error)
            }

        })
    },
    changeProductQuantity: (details) => {
        console.log(details, "yoyoy")
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }).then((response) => {
                        resolve({ status: true })
                    })
            }

        })
    },
    deleteCartProduct: (cartId, proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(cartId) },
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
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let Total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
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
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                        }
                    }

                ]).toArray()
                resolve(Total[0])
            } catch (error) {
                reject(error)
            }

        })

    },
    getProductTotal: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let productTotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
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
                        $match: { item: objectId(proId) }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, proTotal: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                        }
                    }

                ]).toArray()
                resolve(productTotal[0])
            } catch (error) {
                reject(error)
            }

        })
    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, rejecet) => {
            try {
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
                resolve(cart.products)
            } catch (error) {
                reject(error)
            }

        })
    }
}              