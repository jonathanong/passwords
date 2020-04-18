
const Cache = require('async-disk-cache')
const crypto = require('crypto')
const https = require('https')

const cache = new Cache('pwnedpasswords')

const queryPwnedPasswords = (range) => {
  return new Promise((resolve, reject) => {
    https.get(`https://api.pwnedpasswords.com/range/${range}`)
      .on('error', err => reject(err))
      .on('response', res => {
        const chunks = []
        res
          .on('error', err => reject(err))
          .on('data', chunk => chunks.push(chunk))
          .on('end', () => {
            resolve(Buffer.concat(chunks).toString())
          })
      })
      .end()
  })
}

const queryAndCachePwnedPasswords = async (range, onError) => {
  const {
    isCached,
    value
  } = await cache.get(range)
  if (isCached) return value

  const data = await queryPwnedPasswords(range)
  cache.set(range, data).catch(onError)
  return data
}

const isPasswordPwned = async (password, onError) => {
  const sha = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const value = await queryAndCachePwnedPasswords(sha.slice(0, 5), onError)
  return value.includes(sha.slice(5))
}

exports =
module.exports = async (password, timeout, onError) => {
  return Promise.race([
    isPasswordPwned(password).catch((err) => {
      onError(err)
      return false
    }),
    new Promise(resolve => setTimeout(() => resolve(false), timeout))
  ])
}

Object.assign(exports, {
  cache,
  isPasswordPwned,
  queryPwnedPasswords,
  queryAndCachePwnedPasswords
})
