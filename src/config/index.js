module.exports = Object.freeze({
  ENV: process.env.ENV,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  URL: process.env.URL,

  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_LOG_URI: process.env.MONGODB_LOG_URI,

  MAX_LIMIT_LIST: 1000,
  DEFAULT_LIMIT_LIST: 20,

  DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD,

  SECRET_KEY: process.env.SECRET_KEY,
  JWT_TTL: process.env.JWT_TTL,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  CLD_UPLOAD_PATH: process.env.CLD_UPLOAD_PATH,
  LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH,

  IMAGE_MIMETYPES: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
  EXCEL_MIMETYPES: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
})
