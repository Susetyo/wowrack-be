function preSerialization(req, res, next) {
  const _send = res.send

  res.send = function (data) {
    let obj = {
      success: true,
      data: data,
      error: null,
    }

    if (data?.error) {
      obj = {
        success: false,
        data: null,
        error: {
          code: data?.code,
          message: data?.message,
        },
      }
    }

    res.send = _send // set function back to avoid the 'double-send'
    return res.send(obj) // just call as normal with data
  }

  next()
}

module.exports = preSerialization
