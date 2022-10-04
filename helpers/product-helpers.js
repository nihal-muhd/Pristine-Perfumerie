var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId


module.exports = {
    addProduct: (product) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
                resolve(data.insertedId)
            } catch (error) {
                reject(error)
            }
        })
    },
    getProduct: (lim) => {
        return new Promise(async (resolve, reject) => {
            try {
                if (lim) {
                    
                    let Product = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(lim).toArray()
                    resolve(Product)
                } else {
                    Product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                    resolve(Product)
                }
            } catch (error) {
                reject(error)
            }
        })
    },
    
    deleteProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let imgDel = null
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
                imgDel = product.Image
                await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) })
                resolve(imgDel)
            } catch (error) {
                reject(error)
            }
        })
    },
    productDetails: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
                resolve(data)
            } catch (error) {
                reject(error)
            }
        })
    },
    productUpdate: (proId, proDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                let oldImage = null
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
                if (proDetails.Image.length == 0) {
                    proDetails.Image = product.Image
                } else {
                    oldImage = product.Image
                }
                await db.get().collection(collection.PRODUCT_COLLECTION)
                    .updateOne({ _id: objectId(proId) }, {
                        $set: {
                            Pname: proDetails.Pname,
                            Bname: proDetails.Bname,
                            Price: proDetails.Price,
                            Size: proDetails.Size,
                            Quantity: proDetails.Quantity,
                            Description: proDetails.Description,
                            Category: proDetails.Category,
                            Image: proDetails.Image
                        }
                    })
                resolve(oldImage)
            } catch (error) {
                reject(error)
            }
        })
    }

}