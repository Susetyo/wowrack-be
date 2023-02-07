class Repository {
  constructor(model) {
    this.model = model
  }

  async create(data, options = {}) {
    const res = await this.model.create([data], options)
    return Array.isArray(res) ? res[0] : res
  }

  async createMany(arrData, options = {}) {
    const res = await this.model.create(arrData, options)
    return res
  }

  async update(query, data, options = {}) {
    options.runValidators = true
    return await this.model.updateMany(query, data, options)
  }

  async updateById(_id, data, options = {}) {
    const res = await this.update(
      {
        _id,
      },
      data,
      options
    )

    return res?.matchedCount
  }

  async delete(conditions, options = {}) {
    return await this.model.deleteOne(conditions, options)
  }

  async deleteById(_id, options = {}) {
    const res = await this.delete(
      {
        _id,
      },
      options
    )

    return res?.deletedCount
  }

  deleteMany(conditions, options = {}) {
    return this.model.deleteMany(conditions, options)
  }

  async softDelete(_id) {
    return await this.updateById(_id, { deletedAt: new Date() })
  }

  findOne(conditions) {
    return this.model.findOne(conditions)
  }

  findById(id) {
    return this.model.findById(id)
  }

  find({ skip, limit, sort = '-createdAt', populate, filter, select }) {
    return this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate(populate)
      .select(select)
  }

  async findAndCount(query) {
    const list = await this.find(query)
    const count = await this.count(query.filter)

    return { list, count }
  }

  count(filter) {
    return this.model.countDocuments(filter)
  }

  async any(filter) {
    const count = await this.model.countDocuments(filter)
    return count > 0
  }

  aggregate(pipeline, options, callback) {
    return this.model.aggregate(pipeline, options, callback)
  }

  async getIds(filter) {
    const list = await this.model.find(filter).select('_id')
    return list.map((item) => item._id)
  }
}

module.exports = Repository
