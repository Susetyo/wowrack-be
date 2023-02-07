const express = require('express')
const router = express.Router()

const MediaController = require('@/modules/media/media.controller')
const mediaController = new MediaController()

const auth = require('@/middleware/auth')
const uploader = require('@/middleware/file-upload')

router.post(
  '/create',
  auth.optional,
  uploader.single('file'),
  mediaController.create
)

router.get('/:id', mediaController.getDetail)
router.get('/redirect/:id', mediaController.getMediaRedirect)
router.delete('/delete/:id', mediaController.delete)

module.exports = router
