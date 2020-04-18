
const crypto = require('crypto')
const https = require('https')

function suffixIsInRangeSearch (range, suffix, timeout) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://api.pwnedpasswords.com/range/${range}`)
    req.on('error', err => reject(err))
    req.on('response', res => {
      res.setEncoding('utf8')

      let buffer = ''

      res
        .on('error', err => reject(err))
        .on('data', (chunk) => {
          buffer += chunk

          if (buffer.includes(suffix)) return resolve(true)

          const index = buffer.lastIndexOf('\n')
          if (index >= 0) buffer.slice(index + 1)
        })
        .on('end', () => resolve(false))
    })
    req.setTimeout(Math.max(~~timeout, 1), () => req.abort())
    req.end()
  })
}

module.exports = async (password, timeout, onError) => {
  const sha = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const range = sha.slice(0, 5)
  const suffix = sha.slice(5)
  return suffixIsInRangeSearch(range, suffix, timeout).catch((err) => {
    onError(err)
    return null
  })
}
