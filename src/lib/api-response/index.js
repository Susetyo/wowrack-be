// TODO: delete this file

const formatResponse = function (data) {
  return {
    success: true,
    data,
    error: null,
  }
}

const paginateResponse = function (query, data) {
  const DEFAULT_LIMIT_LIST = 20
  const MAX_LIMIT_LIST = 1000

  const { page, perPage } = query

  let _page = parseInt(page, 10)
  let _limit = parseInt(perPage, 10)

  _page = Number.isNaN(_page) ? 1 : _page
  _limit = Number.isNaN(_limit) ? DEFAULT_LIMIT_LIST : _limit

  _limit = Math.min(_limit, MAX_LIMIT_LIST)

  const _skip = _page * _limit - _limit

  const next = _skip + _limit < data.length
  const prev = _skip - _limit >= 0

  return {
    success: true,
    data: {
      pagination: {
        count: data.length,
        next,
        prev,
        page: _page,
        perPage: _limit,
      },
      list: data,
    },
    error: null,
  }
}

const formatError = function (message, statusCode = 400) {
  return {
    success: false,
    data: null,
    error: {
      code: statusCode,
      message,
    },
  }
}

module.exports = {
  formatResponse,
  formatError,
  paginateResponse,
}
