const _ = require('lodash')
const Employee = require('@/modules/employee/employee.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const excel = require('@/entities/excel-entity')
const throwError = require('@/lib/throw-error')
const employeeStatus = require('@/constant/employee-status')

class KPIEntity {
  constructor() {
    this.employeeRepoitory = new Repository(Employee)
    this.userRepository = new Repository(User)
  }

  async parseTicketReviewedKPI(file, data) {
    const workbook = await excel.convert({
      sourceFile: file,
    })

    // get sheets
    const sheetNames = Object.keys(workbook)

    let arr = []
    sheetNames.forEach((sheet, sheetIndex) => {
      // throw error on empty file
      if (workbook[sheet].length <= 0) {
        throwError(
          422,
          `Cannot convert excel data into JSON because ${sheet} sheet is empty`
        )
      }

      // get index of header rows
      // marked by 'A' key with 'Staff Name' value
      const headerIndexes = []
      workbook[sheet].forEach((row, index) => {
        if (row.A === 'Staff Name') {
          headerIndexes.push(index)
        }
      })

      // push content of the file to array
      workbook[sheet].forEach((row, index) => {
        const ticketNameRowIndex =
          Object.keys(row).length === 1
            ? workbook[sheet].indexOf(workbook[sheet][index])
            : null

        if (ticketNameRowIndex === null && !headerIndexes.includes(index)) {
          row.biWeekIndex = sheetIndex

          arr.push(row)
        }
      })
    })

    // take the name and biWeekIndex only
    arr = arr.map((row) => {
      return {
        name: row.A,
        biWeekIndex: row.biWeekIndex,
      }
    })

    const total = [
      {
        totalGoal: 0,
        totalActual: 0,
        percentage: 0,
      },
      {
        totalGoal: 0,
        totalActual: 0,
        percentage: 0,
      },
    ]

    // group array by employee's name and map the array
    // at the same time calculate employee's goal, actual, and percentage
    // during the bi-weekly period
    const list = _(arr)
      .groupBy('name')
      .map((array, key) => {
        const weekOneGoal = countWeeklyTicketCount(arr, 0, key)
        const weekOneActual = countWeeklyTicketCount(arr, 0, key)

        const weekTwoGoal = countWeeklyTicketCount(arr, 1, key)
        const weekTwoActual = countWeeklyTicketCount(arr, 1, key)

        total[0].totalGoal += weekOneGoal
        total[0].totalActual += weekOneActual
        total[0].percentage = !isNaN(total[0].totalGoal / total[0].totalActual)
          ? (total[0].totalGoal / total[0].totalActual) * 100
          : 0

        total[1].totalGoal += weekTwoGoal
        total[1].totalActual += weekTwoActual
        total[1].percentage = !isNaN(total[1].totalGoal / total[1].totalActual)
          ? (total[1].totalGoal / total[1].totalActual) * 100
          : 0

        return {
          supportCoordinator: key,
          biWeekly: [
            {
              goal: weekOneGoal,
              actual: weekOneActual,
              percentage: !isNaN(weekOneGoal / weekOneActual)
                ? (weekOneGoal / weekOneActual) * 100
                : 0,
            },
            {
              goal: weekTwoGoal,
              actual: weekTwoActual,
              percentage: !isNaN(weekTwoGoal / weekTwoActual)
                ? (weekTwoGoal / weekTwoActual) * 100
                : 0,
            },
          ],
        }
      })
      .value()

    // check whether employee exists or not
    for (const row of list) {
      let userId = null
      let isEmployeeExists = false

      const user = await this.userRepository
        .findOne({
          fullname: row.supportCoordinator,
          deletedAt: { $eq: null },
        })
        .select('_id')

      if (user) {
        userId = user._id
      }

      if (data?.kpiDivisionId) {
        isEmployeeExists = await this.employeeRepoitory.any({
          user: userId,
          division: data.kpiDivisionId,
          status: employeeStatus.ACTIVE,
          deletedAt: { $eq: null },
        })
      }

      row.isEmployeeExists = isEmployeeExists
    }

    return { list, total }
  }

  // TODO: handle other kpi document types
}

function countWeeklyTicketCount(arr, biWeekIndex, name) {
  return arr.reduce((prev, curr) => {
    let count = 0
    if (curr.biWeekIndex === biWeekIndex && curr.name === name) {
      count += 1
    }

    return prev + count
  }, 0)
}

module.exports = KPIEntity
