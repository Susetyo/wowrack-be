const KPIHandler = require('@/modules/kpi/kpi.handler')
const kpiHandler = new KPIHandler()

const LogHandler = require('@/modules/log/log.handler')
const logHandler = new LogHandler()

class KPIController {
  async create(req, res, next) {
    try {
      const { body, userId } = req
      const response = await kpiHandler.createKPIHandler(body, userId)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.KPI,
        action: logHandler.action.CREATE,
        data: body,
        description: 'Administrator Creates KPI',
      })

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getList(req, res, next) {
    try {
      const { query } = req
      const response = await kpiHandler.getListKPIHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      const response = await kpiHandler.getDetailKPIHandler(id)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const { body, params, userId } = req
      const { id } = params
      const response = await kpiHandler.updateKPIHandler(id, body, userId)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.KPI,
        action: logHandler.action.UPDATE,
        id: id,
        data: body,
        description: 'Administrator Updates KPI',
      })

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      const kpi = await kpiHandler.deleteKPIHandler(id)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.KPI,
        action: logHandler.action.DELETE,
        id: id,
        data: kpi,
        description: 'Administrator Deletes KPI',
      })

      res.send({})
    } catch (error) {
      next(error)
    }
  }

  async checkUsersInDivision(req, res, next) {
    try {
      const { body } = req
      const response = await kpiHandler.checkUsersInDivisionHandler(body)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getKPILog(req, res, next) {
    try {
      const { query } = req
      const response = await kpiHandler.getKPILogHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = KPIController
