const path = require('path')
const fs = require('fs')
const Media = require('@/modules/media/media.model')
const Repository = require('@/lib/mongodb-repo')
const KPIEntity = require('@/entities/kpi-entity')
const throwError = require('@/lib/throw-error')
const allowedMimeTypes = require('@/constant/allowed-mimetypes')
const KPIDocumentType = require('@/constant/kpi-document-type')
const cloudinary = require('@/infrastructure/cloudinary')
const csv = require('@/entities/csv-entity')
const config = require('@/config')

class MediaHandler {
  constructor() {
    this.mediaRepository = new Repository(Media)
    this.kpiEntity = new KPIEntity()
  }

  // image files will be uploaded dircetly to cloudinary
  // while other file types will be stored in local storage
  // to provide the ability to download files after upload
  async createMediaHandler(data) {
    const dir = config.LOCAL_STORAGE_PATH + data.filename

    // additional prohibited mimetype validation
    // if somehow the file gets uploaded to the server
    if (!allowedMimeTypes.includes(data.mimetype) && fs.existsSync(dir)) {
      // delete the file and throw an error
      fs.unlinkSync(dir)
      throwError(422, `${path.extname(data.filename)} file is not allowed`)
    }

    // handle image files
    if (config.IMAGE_MIMETYPES.includes(data.mimetype)) {
      const result = await cloudinary.uploadAvatar(data)

      data.filename = result.original_filename
      data.path = result.secure_url
      data.size = result.bytes

      // delete file immediately from local storage after successful upload
      fs.unlinkSync(dir)
    }

    // handle csv files
    if (data.mimetype === 'text/csv') {
      const result = await csv.parse(dir)
      console.log(result)
    }

    // handle excel files
    const isUploadingKPIDocument =
      config.EXCEL_MIMETYPES.includes(data.mimetype) &&
      Object.values(KPIDocumentType).includes(data?.kpiDocumentType)

    let excelParseResult = null
    if (isUploadingKPIDocument) {
      if (data.kpiDocumentType === 'ticket-reviewed') {
        excelParseResult = await this.kpiEntity.parseTicketReviewedKPI(
          dir,
          data
        )
      }

      // TODO: handle other kpi document types
    }

    let response = await this.mediaRepository.create(data)
    response = response.toJSON()

    return isUploadingKPIDocument ? { ...response, excelParseResult } : response
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

    // if file's mimetype is in IMAGE_MIMETYPES constant
    if (config.IMAGE_MIMETYPES.includes(media.mimetype)) {
      await cloudinary.deleteAvatar(config.CLD_UPLOAD_PATH + media.filename)
    } else {
      // delete file from local storage
      const dir = config.LOCAL_STORAGE_PATH + media.filename
      if (fs.existsSync(dir)) {
        fs.unlinkSync(dir)
      }
    }

    return await this.mediaRepository.deleteById(id)
  }
}

module.exports = MediaHandler
