const cloudinary = require('cloudinary').v2
const path = require('path')
const config = require('@/config')

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
})

const uploadAvatar = (file) => {
  return new Promise((resolve, reject) => {
    const dir = config.LOCAL_STORAGE_PATH + file.filename
    const extname = path.extname(file.filename)
    const filename = path.basename(file.filename, extname)

    cloudinary.uploader.upload(
      dir,
      {
        folder: config.CLD_UPLOAD_PATH,
        public_id: filename,
        use_filename: true,
        unique_filename: false,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error)
        resolve(result)
      }
    )
  })
}

const deleteAvatar = async (file) => {
  return await cloudinary.uploader.destroy(file)
}

module.exports = { uploadAvatar, deleteAvatar }
