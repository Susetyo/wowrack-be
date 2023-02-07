const Media = require('@/modules/media/media.model')
const Repository = require('@/lib/mongodb-repo')
const cloudinary = require('@/infrastructure/cloudinary')
const config = require('@/config')

class AvatarEntity {
  constructor() {
    this.mediaRepository = new Repository(Media)
  }

  async deleteAvatar(id) {
    const avatar = await this.mediaRepository.findById(id)

    if (avatar) {
      // delete user avatar from cloudinary
      await cloudinary.deleteAvatar(config.CLD_UPLOAD_PATH + avatar.filename)

      // delete avatar from database
      await this.mediaRepository.deleteById(avatar._id)
    }
  }
}

module.exports = new AvatarEntity()
