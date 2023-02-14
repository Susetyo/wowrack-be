const fs = require('fs')
const MediaHandler = require('@/modules/media/media.handler')
const mediaHandler = new MediaHandler()
const throwError = require('@/lib/throw-error')
const config = require('@/config')

class MediaController {
  async create(req, res, next) {
    try {
      const { file, userId, body } = req

      if (req.fileFilterError) {
        throwError(422, req.fileFilterError)
      }

      if (!file) {
        throwError(422, 'Please upload a file')
      }

      const data = {
        name: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        createdBy: userId,
      }

      if (body?.kpiDocumentType) {
        data.kpiDocumentType = body.kpiDocumentType
      }

      if (body?.kpiDivisionId) {
        data.kpiDivisionId = body.kpiDivisionId
      }

      const response = await mediaHandler.createMediaHandler(data)

      res.send(response)
    } catch (error) {
      // delete file immediately if error occured
      if (req.file) {
        const dir = config.LOCAL_STORAGE_PATH + req.file.filename

        if (fs.existsSync(dir)) {
          fs.unlinkSync(dir)
        }
      }

      next(error)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      const response = await mediaHandler.getDetailMediaHandler(id)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getMediaRedirect(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      const response = await mediaHandler.getMediaRedirectHandler(id)

      res.redirect(response)
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      await mediaHandler.deleteMediaHandler(id)

      res.send({})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = MediaController
