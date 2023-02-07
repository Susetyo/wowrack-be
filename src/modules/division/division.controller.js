const DivisionHandler = require('@/modules/division/division.handler')
const divisionHandler = new DivisionHandler()

class DivisionController {
  async create(req, res, next) {
    try {
      const { body, userId } = req
      const response = await divisionHandler.createDivisionHandler(body, userId)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getList(req, res, next) {
    try {
      const { query } = req
      const response = await divisionHandler.getListDivisionHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { params } = req
      const { slug } = params
      const response = await divisionHandler.getDetailDivisionHandler(slug)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const { body, params } = req
      const { id } = params
      await divisionHandler.updateDivisionHandler(id, body)

      res.send({})
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      await divisionHandler.deleteDivisionHandler(id)

      res.send({})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = DivisionController
