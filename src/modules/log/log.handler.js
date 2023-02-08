const Log = require('@/modules/log/log.model')
const Repository = require('@/lib/mongodb-repo')
const logAction = require('@/constant/log-action')
const logModule = require('@/constant/log-module')

class LogHandler {
  constructor() {
    this.module = logModule
    this.action = logAction
    this.logRepository = new Repository(Log)
  }

  async createLogHandler({
    req = null,
    module = null,
    action = null,
    id = null,
    data = null,
    description = null,
  }) {
    const userId = req ? req.userId : null
    const payload = req
      ? {
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
          url: req.originalUrl,
          httpMethod: req.method,
          ip: req.ip,
        }
      : null

    return await this.logRepository.create({
      userId,
      module,
      action,
      payload,
      dataId: id,
      data,
      description,
    })
  }
}

module.exports = LogHandler
