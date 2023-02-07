const path = require('path')
const fs = require('fs')
const Media = require('@/modules/media/media.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')
const allowedMimeTypes = require('@/constant/allowed-mimetypes')
const cloudinary = require('@/infrastructure/cloudinary')

class MediaHandler {
  constructor() {
    this.mediaRepository = new Repository(Media)
  }

  async createMediaHandler(data) {
    const dir = process.env.LOCAL_STORAGE_PATH + data.filename

    // additional prohibited mimetype validation
    // if somehow the file gets uploaded to the server
    if (!allowedMimeTypes.includes(data.mimetype) && fs.existsSync(dir)) {
      // delete the file and throw an error
      fs.unlinkSync(dir)
      throwError(422, `${path.extname(data.filename)} file is not allowed`)
    }

    return await this.mediaRepository.create(data)
  }

  async getDetailMediaHandler(id) {
    const media = await this.mediaRepository.findById(id)

    if (!media) {
      throwError(404, 'Data not found')
    }

    return media
  }

  async getMediaRedirectHandler(id) {
    const media = await this.mediaRepository.findById(id)

    if (!media) {
      throwError(404, 'Data not found')
    }

    return media.fullpath
  }

  async deleteMediaHandler(id) {
    const media = await this.mediaRepository.findById(id)

    if (!media) {
      throwError(404, 'Data not found')
    }

    await cloudinary.deleteAvatar(process.env.CLD_UPLOAD_PATH + media.filename)
    return await this.mediaRepository.deleteById(id)
  }
}

module.exports = MediaHandler
