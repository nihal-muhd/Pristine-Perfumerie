var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId

module.exports = {
    deleteCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) })
            } catch (error) {
                reject(error)
            }
        })
    },
    getOneCategory: (catId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(catId) })
                resolve(category.CategoryName)
            } catch (error) {
                reject(error)
            }
        })
    }
}