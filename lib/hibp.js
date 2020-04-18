
const crypto = require('crypto')
const https = require('https')

function suffixIsInRangeSearch (range, suffix) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.pwnedpasswords.com/range/${range}`)
      .on('error', err => reject(err))
      .on('response', res => {
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
      .end()
  })
}

const isPasswordPwned = async (password, onError) => {
  const sha = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const range = sha.slice(0, 5)
  const suffix = sha.slice(5)
  return suffixIsInRangeSearch(range, suffix)
}

module.exports = async (password, timeout, onError) => {
  return Promise.race([
    isPasswordPwned(password).catch((err) => {
      onError(err)
      return false
    }),
    new Promise(resolve => setTimeout(() => resolve(null), timeout))
  ])
}
