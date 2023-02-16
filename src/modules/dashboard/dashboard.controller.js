const DashboardHandler = require('@/modules/dashboard/dashboard.handler')
const dashboardHandler = new DashboardHandler()

class DashboardController {
  async summary(req, res, next) {
    try {
      const response = await dashboardHandler.getSummaryHandler()
      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getListEmployee(req, res, next) {
    try {
      const { query } = req
      const response = await dashboardHandler.getListEmployeeHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getStatistic(req, res, next) {
    try {
      const { query } = req
      const response = await dashboardHandler.getStatisticHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getEmployeeRanks(req, res, next) {
    try {
      const { query } = req
      const response = await dashboardHandler.getEmployeeRanksHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = DashboardController
