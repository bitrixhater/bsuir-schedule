'use strict'

const GroupsListParser = require('./GroupsListParser')

/**
 * Class for parsing teacher list based on GroupListParser
 */
class TeachersListParser extends GroupsListParser {
  constructor(config) {
    super(config)

    this.url = config.url || 'https://www.bsuir.by/schedule/allEmployees.xhtml'
  }

  get sliceLength () {
    return 30
  }
}

module.exports = TeachersListParser