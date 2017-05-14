'use strict'

/**
 * Represents any requester class
 * 
 * if you want to create your own requester, you have to extend BaseRequester 
 * and override all methods
 */
class BaseRequester {
  /**
   * Method for getting the data by the GET method
   *
   * @param {string} url
   * @param {Object} params
   * @return {Promise<String>}
   */
  get(url, params) { throw 'Not implemented' }
  
  /**
   * Method for getting the data by the POST method
   *
   * @param {string} url
   * @param {Object} params
   * @return {Promise<String>}
   */
  post(url, params) { throw 'Not implemented' }
}

module.exports = BaseRequester