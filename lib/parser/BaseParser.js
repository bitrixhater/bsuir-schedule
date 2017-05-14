'use strict'

/**
 *  Base class for all parsers
 */
class BaseParser {
  /**
   * @param {{
   * requester: BaseRequester,
   * cacheManager: BaseCacheManager,
   * cacheTime: Number,
   * requestParams: Object
   * }} config
   */
  constructor(config) {
    config = config || {}
    this.requester = config.requester
    this.cacheManager = config.cacheManager
    this.cacheTime = (config.cacheTime || 3600) * 1000
    this.requestParams = config.requestParams || {}
  }

  /**
   * Methor for taking parsed data
   *
   * @param {string} url - will be taken from this.url if it does not exist
   * @return {Promise<Object>}
   */
  get(url) {
    url = url || this.url
    return this.cacheManager.get(url)
    .then(cached => {
      if (!cached) {
        return this._request(url)
      }
      return Promise.resolve(cached)
    })
  }

  /**
   * Private methor for making request, calling parse method, then adding results to the cache
   * params for request and a the cacheTime will be taken from this.cacheTime and this.prequestParams
   *
   * @param {string} url
   * @return {Promise<Object>}
   */
  _request(url) {
    url = url || this.url
    return this.requester.get(url, this.requestParams)
    .then(body => this._parse(body))
    .then(result => {
      // console.log('Pushing to cache storage')
      return this.cacheManager.set(url, result, this.cacheTime)
      .then(() => Promise.resolve(result))
    })
  }

  /**
   * Method for parsing data from the body
   * Called from _request method
   */
  _parse(body) { throw 'Not implemented' }
}

module.exports = BaseParser