'use strict'

/**
 * Represents some abstract cache manager
 * you must extend BaseCacheManager and override all methods to create your own cache manager
 */
class BaseCacheManager {

    /**
     * @param  {Object} config - Object of settings for storage
     */
    constructor(config) {
        config = config || {}
        this.cacheTime = (config.cacheTime || 0) * 1000
    }

    /**
     * @param {string} key
     * @returns {Promise<Object>}
     */
    get(key) { throw 'Not implemented' }

    /**
     * @param {string} key
     * @param {Object} data
     * @param {Number} cacheTime - Cache time in seconds
     * @returns {Promise}
     */
    set(key, data, cacheTime) { throw 'Not implemented' }

    /**
     * @param {string} storage
     * @param {string} key
     * @returns {Promise}
     */
    remove(key) { throw 'Not implemented' }

    /**
    * @returns {Promise}
    */
    clear() { throw 'Not implemented' }
}

module.exports = BaseCacheManager