const bcrypt = require('bcrypt')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')
const { generateAccessToken } = require('@/lib/helpers')
const avatarEntity = require('@/entities/avatar-entity')

class AuthHandler {
  constructor() {
    this.userRepository = new Repository(User)
  }

  async requestAccessTokenHandler(data) {
    const { email, password } = data
    const user = await this.userRepository.findOne({
      email,
      deletedAt: { $eq: null },
    })

    if (!user) {
      throwError(404, 'User not found')
    }

    const isPasswordMatches = await bcrypt.compare(password, user.password)
    if (!isPasswordMatches) {
      throwError(400, 'Wrong email or password!')
    }

    return generateAccessToken(user)
  }

  async getProfileHandler(userId) {
    let user = await this.userRepository
      .findOne({
        _id: userId,
        deletedAt: { $eq: null },
      })
      .populate([
        {
          path: 'avatar',
          select: 'path fullpath',
        },
        {
          path: 'position',
          select: 'name',
        },
      ])

    if (!user) {
      throwError(404, 'User not found')
    }

    user = user.toJSON()
    user.position = user.position.name
    delete user.password

    return user
  }

  async updateProfileHandler(userId, data) {
    const user = await this.userRepository.findOne({
      _id: userId,
      deletedAt: { $eq: null },
    })

    if (!user) {
      throwError(404, 'User not found')
    }

    // delete user's avatar only when user's avatar is not null
    if (user.avatar && String(user.avatar) !== data.avatar) {
      await avatarEntity.deleteAvatar(user.avatar)
    }

    return await this.userRepository.updateById(userId, data)
  }
}

module.exports = AuthHandler
