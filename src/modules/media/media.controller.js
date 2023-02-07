const fs = require('fs')
const MediaHandler = require('@/modules/media/media.handler')
const mediaHandler = new MediaHandler()
const throwError = require('@/lib/throw-error')
const cloudinary = require('@/infrastructure/cloudinary')
const csv = require('@/entities/csv-entity')

class MediaController {
  async create(req, res, next) {
    try {
      const { file, userId } = req

      if (req.fileFilterError) {
        throwError(422, req.fileFilterError)
      }

      if (!file) {
        throwError(422, 'Please upload a file')
      }

      const dir = process.env.LOCAL_STORAGE_PATH + file.filename

      const data = {
        name: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        createdBy: userId,
      }

      const IMAGE_MIMETYPES = [
        'image/jpg',
        'image/jpeg',
        'image/png',
        'image/webp',
      ]

      if (IMAGE_MIMETYPES.includes(file.mimetype)) {
        const result = await cloudinary.uploadAvatar(file)

        data.name = file.originalname
        data.filename = result.original_filename
        data.path = result.secure_url
        data.size = result.bytes
        data.mimetype = file.mimetype
      }

      if (file.mimetype === 'text/csv') {
        const result = await csv.parse(dir)
        // TODO: handle insert many
        console.log(result)
      }

      // delete file immediately from local storage after successful upload
      fs.unlinkSync(dir)

      const response = await mediaHandler.createMediaHandler(data)
      res.send(response)
    } catch (error) {
      // delete file immediately if error occured
      if (req.file) {
        const dir = process.env.LOCAL_STORAGE_PATH + req.file.filename
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
