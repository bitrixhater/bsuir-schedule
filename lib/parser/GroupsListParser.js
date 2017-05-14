'use strict'

const BaseParser = require('./BaseParser')
const cheerio = require('cheerio')

class GroupsListParser extends BaseParser {
  /**
   * Constructor for groups list parser
   * 
   * @param {{
   * requester: BaseRequester,
   * cacheManager: BaseCacheManager,
   * cacheTime: number,
   * requestParams: Object,
   * url: string
   * }} config
   */
  constructor(config) {
    super(config)

    this.url = config.url || 'https://www.bsuir.by/schedule/allStudentGroups.xhtml'
  }

  get sliceLength () {
    return 22
  }

  _parse(body) {
    let result = []
    let $ = cheerio.load(body)
    $('a').each((i, el) => {
      el = $(el)
      result.push({
        name: el.text().slice(this.sliceLength),
        url: el.attr('href')
      })
    })
    return result
  }
}

module.exports = GroupsListParser