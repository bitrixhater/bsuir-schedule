'use strict'

const BaseParser = require('./BaseParser')
const cheerio = require('cheerio')

/**
 * Class for parsing schedule page
 */
class ScheduleParser extends BaseParser {
  
  _parse(body) {
    let $ = cheerio.load(body, {decodeEntities: false})

    let result = this._parseInfo($)

    let session = this._parseSession($)
    if (session.length) result.session = session

    let schedule = this._parseSchedule($)
    if (schedule.length) {
      result.schedule = schedule
    } else {
      schedule = this._parseTeacherSchedule($)
      if (schedule.length) result.schedule = schedule
    }

    return result
  }

  _parseInfo($) {
    let result = {}

    let searchTab = $('#studentGroupTab\\:filterTab td:nth-child(2) label')
    if (searchTab.length) {
      searchTab.each((i, label) => {
        let labelText = $(label).text().trim()
        
        if (!label) return

        switch (i) {
          case 0:
            result.faculty = labelText
            break
          case 1:
            result.course = parseInt(labelText)
            break
          case 2:
            result.specialty = labelText
            break
          case 3:
            result.name = labelText
        }
      })
      if (!result.name) result = {}
    } else {
      result.photo = $('img.employee-avatar').attr('src')
      result.name = $('img.employee-avatar + span').text().trim()
    }

    return result
  }

  _parseSession($) {
    let results = []
    let date
    $('div#tableForm\\:studentGroupScheduleTabView\\:tableZaoch tr')
    .each((i, tr) => {
      tr = $(tr)

      if (tr.hasClass('ui-widget-header')) {
        date = tr.text().trim()
        results.push({
          date: date,
          lessons: []
        })
        return
      }

      if (date) {
        let lesson = {}

        tr.find('td')
        .each((i, td) => {
          td = $(td)

          if (td.is('[style="background-color: #ffd8da;"]'))
            lesson.red = true

          switch (i) {
            case 0:
              let time = td.text().trim()
              if (time) lesson.time = time
              break
            case 1:
              let subgroup = td.text().trim()
              if (subgroup) lesson.subgroup = subgroup
              break
            case 2:
              let tooltip = td.find('.ui-tooltip')
              if (tooltip.length) {
                lesson.subject = {
                  name: td.find('> span').text().trim(),
                  description: tooltip.find('.ui-tooltip-text')
                    .text().split('\n').map(str => str.trim()).join('\n').trim()
                }
              } else {
                lesson.subject = {
                  name: td.text().trim()
                }
              }
              break
            case 3:
              let type = td.text().trim()
              if (type) lesson.type = type
              break
            case 4:
              let classroom = td.text().trim()
              if (classroom) lesson.classroom = classroom
              break
            case 5:
              let links = td.find('a')
              let key = 'teachers'

              if (/\d/.test(links.text()))
                key = 'groups'

              lesson[key] = []

              links.each((i, link) => {
                link = $(link)
                let teacher = {
                  name: link.text().trim() || td.text(),
                  url: 'https://www.bsuir.by' + link.attr('href')
                }
                let linkID = link.attr('id')
                if (linkID) {
                  linkID = linkID.slice(0, -12)
                  let img = td.find('[id="' + linkID + 'toolTipEmployee"] img')
                  if (img.length)
                    teacher.photo = img.attr('src')
                }
                lesson[key].push(teacher)
              })

              if (!lesson[key].length)
                lesson[key] = undefined

              break
            case 6:
              let note = td.text().trim()
              if (note) lesson.note = note
              break
          }
        })

        results[results.length - 1].lessons.push(lesson)
      }
    })

    return results
  }

  _parseSchedule($) {
    let results = []
    let day

    $('form#tableForm\\:studentGroupScheduleTabView\\:tableForm > div:not(.employeeScheduleStyle) tr')
    .each((i, tr) => {
      tr = $(tr)

      if (tr.hasClass('ui-widget-header')) {
        day = tr.text().trim()
        results.push({
          day: day,
          lessons: []
        })
        return
      }

      if (day) {
        let lesson = {}

        tr.find('td')
        .each((i, td) => {
          td = $(td)

          if (td.is('[style="background-color: #ffd8da;"]'))
            lesson.red = true

          switch (i) {
            case 0:
              let weeks = td.text().trim()
              if (weeks) lesson.weeks = weeks
              break
            case 1:
              let time = td.text().trim()
              if (time) lesson.time = time
              break
            case 2:
              let tooltip = td.find('.ui-tooltip')
              if (tooltip.length) {
                lesson.subject = {
                  name: td.find('> span').text().trim(),
                  description: tooltip.find('.ui-tooltip-text')
                    .text().split('\n').map(str => str.trim()).join('\n').trim()
                }
              } else {
                lesson.subject = {
                  name: td.text().trim()
                }
              }
              break
            case 3:
              let subgroup = td.text().trim()
              if (subgroup) lesson.subgroup = subgroup
              break
            case 4:
              let classroom = td.text().trim()
              if (classroom) lesson.classroom = classroom
              break
            case 5:
              let links = td.find('a')
              let key = 'teachers'

              if (/\d/.test(links.text()))
                key = 'groups'

              lesson[key] = []

              links.each((i, link) => {
                link = $(link)
                let teacher = {
                  name: link.text().trim() || td.text(),
                  url: 'https://www.bsuir.by' + link.attr('href')
                }
                try {
                  let linkID = link.attr('id').slice(0, -12)
                  if (linkID) {
                    teacher.photo = td.find('[id="' + linkID + 'toolTipEmployee"] img').attr('src')
                  }
                } finally {
                  lesson[key].push(teacher)
                }
              })

              if (!lesson[key].length)
                lesson[key] = undefined

              break
            case 6:
              let note = td.text().trim()
              if (note) lesson.note = note
              break
          }
        })

        results[results.length - 1].lessons.push(lesson)
      }
    })

    return results
  }

  _parseTeacherSchedule($) {
    let results = []
    let days = []

    $('#tableForm\\:studentGroupScheduleTabView\\:scheduleTab > div.employeeScheduleStyle tr')
    .each((i, tr) => {
      tr = $(tr)

      if (i === 0) {
        tr.find('th:nth-child(n+2)')
        .each((j, th) => {
          th = $(th)

          results.push({
            day: th.text().replace(' (сегодня)', '').trim(),
            lessons: []
          })
        })
        return
      }

      let time = {}
      tr.find('td')
      .each((j, td) => {
        td = $(td)

        if (j === 0) {
          time = td.text().trim()
          return
        }

        let preResult = {}

        td.find('> div')
        .each((k, div) => {
          div = $(div)
          let data = $(div).html().toString().trim()

          if (!div.text().trim()) return

          if (data) {
            let everyWeek = /^[^<]+/

            everyWeek = !everyWeek.test(data)

            let weeksRegex = /^(\([^\)]*\)\s*)?(.*)\s*(<br>\s*)?$/i
            let key = weeksRegex.exec(data)
            if (!key) return
            key = key[2]

            if (!preResult[key]) {
              preResult[key] = {
                time: time,
                groups: []
              }

              let subjectDataAt

              let groupRegex = /<a href=\"([^"]*)\">([^<]*)<\/a>(-\d+)?/gi
              let group
              while ((group = groupRegex.exec(data)) != null) {
                preResult[key].groups.push({
                  name: group[2].trim() + (group[3] || '').trim(),
                  url: 'https://www.bsuir.by' + group[1].trim()
                })
                subjectDataAt = data.indexOf(group[0]) + group[0].length
              }

              let subgroupRegex = /(>|-\d+)\s*\(([^0-9]*\d+)[^)]*\)/
              let subgroup = subgroupRegex.exec(data) || []
              if (subgroup.length) {
                preResult[key].subgroup = subgroup[2]
                subjectDataAt = data.indexOf(subgroup[0]) + subgroup[0].length
              }

              data = data.slice(subjectDataAt)
              let infoRegex = /(\([^\)]*\))?(.*)\(([^\)]*)\)\s*([0-9\-]+)(\s*(<br>)?\s*)$/
              let info = infoRegex.exec(data) || []
              if (info.length) {
                preResult[key].subject = {
                  name: info[2].trim()
                }
                preResult[key].type = info[3].trim()
                preResult[key].classroom = info[4].trim()
              }
            }

            if (!everyWeek) {
              preResult[key].weeks = preResult[key].weeks || []
              preResult[key].weeks.push(k + 1)
            }
          }
        })

        for(let index in preResult) { 
          if (preResult.hasOwnProperty(index)) {
            if (preResult[index].weeks)
              preResult[index].weeks = preResult[index].weeks .join(', ')
            results[j - 1].lessons.push(preResult[index])
          }
        }
      })

    })

    results = results.filter(el => el.lessons.length)

    return results
  }
}

module.exports = ScheduleParser