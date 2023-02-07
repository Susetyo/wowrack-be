const cloudinary = require('cloudinary').v2
const path = require('path')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadAvatar = (file) => {
  return new Promise((resolve, reject) => {
    const dir = process.env.LOCAL_STORAGE_PATH + file.filename
    const extname = path.extname(file.filename)
    const filename = path.basename(file.filename, extname)

    cloudinary.uploader.upload(
      dir,
      {
        folder: process.env.CLD_UPLOAD_PATH,
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
