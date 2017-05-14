'use strict'

const BaseCacheManager = require('./BaseCacheManager')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.Promise = global.Promise

/**
 * Cache manager that uses mongo db for storing
 */
class MongoDBCacheManager extends BaseCacheManager {
  static get CacheManagerSchema() {
    return new Schema({
      key: String,
      cachedUntil: {
        type: Number,
        default: 0
      },
      data: Schema.Types.Mixed,
    })
  }

  constructor(config) {
    super(config)

    config = Object.assign({}, config || {}, process.env.BSUIRSchedule || {})
    let modelName = config.modelName || 'BSUIRScheduleCache'

    if (config.uri) {
      mongoose.connect(config.uri)
    }

    this.CacheManager = (mongoose.models && mongoose.models[modelName]) 
      ? mongoose.models[modelName]
      : mongoose.model(modelName, this.constructor.CacheManagerSchema)
  }

  /**
   * @param {string} key
   * @returns {Promise<Object>}
   */
  get(key) { 
    return this.CacheManager.findOne({
      key: key,
      $or: [{
        cachedUntil: { $gt: Date.now() },
      }, {
        cachedUntil: 0
      }]
    })
    .exec()
    .then(cachedData => Promise.resolve((cachedData || {}).data))
  }

  /**
   * @param {string} key
   * @param {Object} data
   * @param {number} cacheTime
   * @returns {Promise}
   */
  set(key, data, cacheTime) {
    /*return this.CacheManager.findOne({
        key: key
      })
    .exec()
    .then(cachedData => {
      console.log(cachedData)
      cachedData = cachedData || new this.CacheManager()
      cachedData.key = key
      cachedData.data = data
      if (cacheTime || this.cacheTime)
        cachedData.cachedUntil = Date.now() + (cacheTime ? cacheTime * 1000 : this.cacheTime)
      else
        cachedData.cachedUntil = 0

      return cachedData.save()
    }, console.log)*/

    return  new Promise((resolve, reject) => {
      this.CacheManager.findOne({
        key: key
      }, (err, cachedData) => {
        // console.log('heey', err, cachedData)

        if (err)
          return reject(new Error(err))

        cachedData = cachedData || new this.CacheManager()
        cachedData.key = key
        cachedData.data = data
        if (cacheTime || this.cacheTime)
          cachedData.cachedUntil = Date.now() + (cacheTime ? cacheTime * 1000 : this.cacheTime)
        else
          cachedData.cachedUntil = 0

         resolve(cachedData.save())
      })
    })
  }

  /**
   * @param {string} key
   * @returns {Promise}
   */
  remove(key) { 
    return this.CacheManager.remove({
      key: key
    })
    .exec()
  }

  /**
   * @returns {Promise}
   */
  clear() { 
    return this.CacheManager.remove({})
    .exec()
  }
}

module.exports = MongoDBCacheManager