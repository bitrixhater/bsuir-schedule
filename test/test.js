const assert = require('assert')

const RAMCacheManager = require('../lib/cacheManager/RAMCacheManager')
const MongoDBCacheManager = require('../lib/cacheManager/MongoDBCacheManager')
const BSUIR = require('../lib/BSUIRSchedule')

describe('Проверяем RAMCacheManager', function() {
  describe('Устанавливаем ключ "testKey" в значение ["testValue"]', function() {
    let ramCacheManager = new RAMCacheManager()
    it('без времени жизни и получаем его сразу', function(done) {
      ramCacheManager.set('testKey', ['testValue'])
      .then(() => ramCacheManager.get('testKey')
        .then(testValue => {
          assert(testValue[0] === 'testValue' && (testValue.length === 1))
          done()
        })
        .catch(done)
      )
    })

    it('со временем жизни 0.01 секунды и получаем его через 0.005 секунду', function(done) {
      ramCacheManager.set('testKey', ['testValue'], 0.01)
      setTimeout(() => {
        ramCacheManager.get('testKey')
        .then(testValue => {
          assert(testValue[0] === 'testValue' && (testValue.length === 1))
          done()
        })
        .catch(done)
      }, 5)
    })

    it('со временем жизни 0.005 секунд и пытаемся получить его через 0.01 секунду', function(done) {
      ramCacheManager.set('testKey', ['testValue'], 0.005)
      setTimeout(() => {
        ramCacheManager.get('testKey')
        .then(testValue => {
          assert(!testValue)
          done()
        })
        .catch(done)
      }, 10)
    })
  })
})

describe('Проверяем MongoDBCacheManager', function() {
  describe('Устанавливаем ключ "testKey" в значение ["testValue"]', function() {
    let mongoDBCacheManager = new MongoDBCacheManager({
      uri: 'mongodb://localhost/BSUIRScheduleTest'
    })

    it('без времени жизни и получаем его сразу', function(done) {
      mongoDBCacheManager.set('testKey', ['testValue'])
      .then(() => mongoDBCacheManager.get('testKey')
        .then(testValue => {
          assert(testValue[0] === 'testValue' && (testValue.length === 1))
          done()
        })
        .catch(done)
      )
    })

    it('со временем жизни 0.5 секунды и получаем его через 0.25 секунд', function(done) {
      mongoDBCacheManager.set('testKey', ['testValue'], 0.5)
      .catch(done)
      setTimeout(() => {
        mongoDBCacheManager.get('testKey')
        .then(testValue => {
          assert(testValue[0] === 'testValue' && (testValue.length === 1))
          done()
        })
        .catch(done)
      }, 250)
    })

    it('со временем жизни 0.1 секунд и пытаемся получить его через 0.25 секунд', function(done) {
      mongoDBCacheManager.set('testKey', ['testValue'], 0.1)
      .catch(done)
      setTimeout(() => {
        mongoDBCacheManager.get('testKey')
        .then(testValue => {
          assert(!testValue)
          done()
        })
        .catch(done)
      }, 250)
    })
  })
})

describe('BSUIRSchedule', function() {
  let schedule = new BSUIR.BSUIRSchedule()
  schedule.cacheManager.clear()

  it('.groups()', function (done) {
    this.timeout(6000)
    assert.ok(true)
    schedule.groups()
    .then(groups => {
      if (Array.isArray(groups)){
        console.log('    Первый элемент: ', JSON.stringify(groups[0]))
        assert(true)
        done()
      } else {
        assert(false)
        done(new Error('Возможно, сайт с расписанием недоступен. Список полученных групп - не массив.'))
      }
    })
    .catch(done)
  })

  it('.groups() - ещё раз, но с мелким таймаутом, т.к. должно быть закешировано', function (done) {
    this.timeout(200)
    assert.ok(true)
    schedule.groups()
    .then(groups => {
      if (Array.isArray(groups)){
        assert(true)
        done()
      } else {
        assert(false)
        done(new Error('Что-то не так с кешем. Список полученных оттуда групп - не массив.'))
      }
    })
    .catch(done)
  })

  it('.teachers()', function (done) {
    this.timeout(6000)
    assert.ok(true)
    schedule.teachers()
    .then(teachers => {
      if (Array.isArray(teachers)){
        console.log('    Первый элемент: ', JSON.stringify(teachers[0]))
        assert(true)
        done()
      } else {
        assert(false)
        done(new Error('Возможно, сайт с расписанием недоступен. Список полученных групп - не массив.'))
      }
    })
    .catch(done)
  })

  it('.teachers() - ещё раз, но с мелким таймаутом, т.к. должно быть закешировано', function (done) {
    this.timeout(200)
    assert.ok(true)
    schedule.teachers()
    .then(teachers => {
      if (Array.isArray(teachers)){
        assert(true)
        done()
      } else {
        assert(false)
        done(new Error('Что-то не так с кешем. Список полученных оттуда групп - не массив.'))
      }
    })
    .catch(done)
  })

  it('.schedule(\'https://www.bsuir.by/schedule/scheduleEmployee.xhtml?id=504552\')', function (done) {
    this.timeout(6000)
    assert.ok(true)
    schedule.schedule('https://www.bsuir.by/schedule/scheduleEmployee.xhtml?id=504552')
    .then(schedule => {
      console.log(JSON.stringify(schedule, false, 2))
      if (typeof schedule === 'object') {
        assert(true)
        done()
      } else {
        assert(false)
        done(new Error('Возможно, сайт с расписанием недоступен. Список полученных групп - не массив.'))
      }
    })
    .catch(done)
  })

  it('.schedule(\'https://www.bsuir.by/schedule/scheduleEmployee.xhtml?id=504552\')\
 - ещё раз, но с мелким таймаутом, т.к. должно быть закешировано', function (done) {
    this.timeout(200)
    assert.ok(true)
    schedule.schedule('https://www.bsuir.by/schedule/scheduleEmployee.xhtml?id=504552')
    .then(schedule => {
      if (typeof schedule === 'object') {
        assert(true)
        done()
      } else {
        assert(false)
        done(new Error('Что-то не так с кешем. Список полученных оттуда групп - не массив.'))
      }
    })
    .catch(done)
  })
})