const multer = require('multer')
const path = require('path')
const fs = require('fs')
const allowedMimeTypes = require('@/constant/allowed-mimetypes')
const { removeSpecialCharacter } = require('@/lib/helpers')

/**
 * TODO:
 * 1. upload user avatar to cloudinary
 * 2. do not store uploaded csv to server
 */

// define multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // create directory if it doesn't exists
    if (!fs.existsSync(process.env.LOCAL_STORAGE_PATH)) {
      fs.mkdirSync(process.env.LOCAL_STORAGE_PATH, { recursive: true })
    }

    cb(null, process.env.LOCAL_STORAGE_PATH)
  },
  filename: function (req, file, cb) {
    const uid = Date.now()
    const extname = path.extname(file.originalname)

    let filename = path.basename(file.originalname, extname)
    filename = removeSpecialCharacter(filename)

    cb(null, filename + '-' + uid + extname)
  },
})

const fileFilter = function (req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    // store error message in req
    req.fileFilterError = `${path.extname(
      file.originalname
    )} file is not allowed`

    return cb(null, false)
  }

  cb(null, true)
}

module.exports = multer({
  storage,
  fileFilter,
})
