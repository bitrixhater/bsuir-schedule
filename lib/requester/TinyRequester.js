'use strict'

const BaseRequester = require('./BaseRequester')
const req = require('tiny_request')

/**
 * @class Class for requesting based on tiny_request library
 */
class TinyRequester extends BaseRequester {

  /**
   * Method for getting the data by the GET method
   *
   * @param {string} url
   * @param {Object} params
   * @return {Promise<String>}
   */
  get(url, params) {
    return new Promise((resolve, reject) => {
      req.get(Object.assign(params, {
        url: url
      }), (body, response, err) => {
        if (!err && response.statusCode == 200) {
          return resolve(body)
        }
        console.log(response)
        return reject(new Error(err))
      })
    })
  }
  
  /**
   * Method for getting the data by the POST method
   *
   * @param {string} url
   * @param {Object} params
   * @return {Promise<String>}
   */
  post(url, params) { throw 'Not implemented' }
}

module.exports = TinyRequester