const PerformanceReviewHandler = require('@/modules/performance-review/performance-review.handler')
const performanceReviewHandler = new PerformanceReviewHandler()

class PerformanceReviewController {
  async getList(req, res, next) {
    try {
      const { query } = req
      const response = await performanceReviewHandler.getListHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { params } = req
      const { slug } = params
      const response = await performanceReviewHandler.getDetailHandler(slug)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = PerformanceReviewController
