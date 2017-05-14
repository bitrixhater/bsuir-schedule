'use strict'

const BaseCacheManager = require('./BaseCacheManager')

/**
 * Cache manager that uses variables for storing
 */
class RAMCacheManager extends BaseCacheManager {
  constructor(config) {
    super(config)

    this.cache = {}
    this.cacheTimeouts = {}
  }

  /**
   * @param {string} key
   * @returns {Promise<Object>}
   */
  get(key) {
    if (this.cacheTimeouts[key] && (this.cacheTimeouts[key] < Date.now()))
      return this.remove(key)

    return Promise.resolve(this.cache[key])
  }

  /**
   * @param {string} key
   * @param {Object} data
   * @param {number} cacheTime
   * @returns {Promise}
   */
  set(key, data, cacheTime) {
    this.remove(key)

    this.cache[key] = data

    if (cacheTime || this.cacheTime)
      this.cacheTimeouts[key] = Date.now() + (cacheTime ? cacheTime * 1000 : this.cacheTime)
    
    return Promise.resolve(true)
  }

  /**
   * @param {string} key
   * @returns {Promise}
   */
  remove(key) {
    return Promise.resolve(this.cacheTimeouts[key] = this.cache[key] = undefined)
  }

  /**
   * @returns {Promise} 
   */
  clear() {
    this.cache = {}
    this.cacheTimeouts = {}

    return Promise.resolve(true)
  }
}

module.exports = RAMCacheManager