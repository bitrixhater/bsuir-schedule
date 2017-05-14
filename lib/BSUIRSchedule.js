'use strict'

const BaseRequester = require('./requester/BaseRequester')
const BaseCacheManager = require('./cacheManager/BaseCacheManager')

const GroupsListParser = require('./parser/GroupsListParser')
const TeachersListParser = require('./parser/TeachersListParser')
const ScheduleParser = require('./parser/ScheduleParser')
const RAMCacheManager = require('./cacheManager/RAMCacheManager')
const MongoDBCacheManager = require('./cacheManager/MongoDBCacheManager')
const TinyRequester = require('./requester/TinyRequester')

const mongoose = require('mongoose')

/**
 * Represents main lib class
 */
class BSUIRSchedule {
  /**
   * Lib constructor
   * 
   * @param {{
   * requester: BaseRequester,
   * cacheManager: BaseCacheManager,
   * cacheManagerConfig: Object,
   * groupsCacheTime: Number,
   * groupsRequestParams: Object,
   * teachersCacheTime: Number,
   * teachersRequestParams: Object,
   * scheduleCacheTime: Number,
   * scheduleRequestParams: Object
   * }} config
   */
  constructor(config) {
    config = config || {}

    let cacheManager
     = this.cacheManager 
     = config.cacheManager 
       || ([1, 2].indexOf(mongoose.connection.readyState) > -1) 
          ? new MongoDBCacheManager(config.cacheManagerConfig || {})
          : new RAMCacheManager(config.cacheManagerConfig || {})

    let requester = this.requester = config.requester || new TinyRequester()

    this.groupsListParser = new GroupsListParser({
      requester: requester,
      cacheManager: cacheManager,
      cacheTime: (config.groupsCacheTime || 3600) * 1000,
      requestParams: config.groupsRequestParams
    })

    this.teachersListParser = new TeachersListParser({
      requester: requester,
      cacheManager: cacheManager,
      cacheTime: (config.teachersCacheTime || 3600) * 1000,
      requestParams: config.teachersRequestParams
    })

    this.scheduleParser = new ScheduleParser({
      requester: requester,
      cacheManager: cacheManager,
      cacheTime: (config.scheduleCacheTime || 3600) * 1000,
      requestParams: config.scheduleRequestParams
    })
  }

  groups() {
    return this.groupsListParser.get()
  }

  teachers() {
    return this.teachersListParser.get()
  }

  schedule(url) {
    return this.scheduleParser.get(url)
  }
}

module.exports = {
  BSUIRSchedule: BSUIRSchedule,
  BaseRequester: BaseRequester,
  BaseCacheManager: BaseCacheManager
}