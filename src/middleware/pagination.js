const config = require('@/config')

const parsePagination = ({ page, perPage }) => {
  let _page = parseInt(page, 10)
  let _limit = parseInt(perPage, 10)

  _page = Number.isNaN(_page) ? 1 : _page
  _limit = Number.isNaN(_limit) ? config.DEFAULT_LIMIT_LIST : _limit

  _limit = Math.min(_limit, config.MAX_LIMIT_LIST)

  const _skip = _page * _limit - _limit

  return {
    skip: _skip,
    limit: _limit,
    page: _page,
    perPage: _limit,
  }
}

const parse = (req, res, next) => {
  req.query = {
    ...req.query,
    ...parsePagination({
      page: req.query.page,
      perPage: req.query.perPage,
    }),
  }

  if (req.query.filter) {
    req.query.filter = JSON.parse(req.query.filter || '{}')
  }

  return next()
}

const paging = (req, res, next) => {
  const _send = res.send

  // modify res.send to include pagination
  res.send = function (data) {
    const { count, list } = data
    const { skip, limit, page, perPage } = req.query

    data = {
      pagination: {
        count,
        next: skip + limit < count,
        prev: skip - limit >= 0,
        page,
        perPage,
      },
      list,
    }

    res.send = _send // set function back to avoid the 'double-send'
    return res.send(data) // just call as normal with data
  }

  next()
}

module.exports = {
  parse,
  paging,
}
