
const findCacheDir = require('find-cache-dir')
const crypto = require('crypto')
const https = require('https')
const path = require('path')
const fs = require('fs')

const tmpdir = findCacheDir({ name: '@jongleberry/passwords', create: true })

module.exports = async (password, timeout, onError) => {
  const sha = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
  const range = sha.slice(0, 5)
  const suffix = sha.slice(5)
  return suffixIsInRangeSearch(range, suffix, timeout, onError).catch((err) => {
    onError(err)
    return null
  })
}

async function suffixIsInRangeSearch (range, suffix, timeout, onError) {
  let stream
  const fd = await fs.promises.open(thunk(range), 'r').catch(() => null)
  if (fd) {
    stream = fs.createReadStream(thunk(range), { fd })
  } else {
    stream = await getRangeSearchFromHIBP(range, timeout)
    saveRangeSearchToCache(range, stream).catch(onError)
  }

  return suffixIsInRangeSearchStream(stream, suffix)
}

function suffixIsInRangeSearchStream (stream, suffix) {
  return new Promise((resolve, reject) => {
    let buffer = ''
    stream.setEncoding('utf8')
    stream.on('error', err => reject(err))
    stream.on('data', (chunk) => {
      buffer += chunk

      if (buffer.includes(suffix)) return resolve(true)

      const index = buffer.lastIndexOf('\n')
      if (index >= 0) buffer.slice(index + 1)
    })
    stream.on('end', () => resolve(false))
  })
}

function getRangeSearchFromHIBP (range, timeout) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://api.pwnedpasswords.com/range/${range}`)
    req.on('error', err => reject(err))
    req.on('response', res => resolve(res))
    req.setTimeout(Math.max(~~timeout, 1), () => req.abort())
    req.end()
  })
}

async function saveRangeSearchToCache (range, stream) {
  const temp = thunk(`_${range}`)
  await new Promise((resolve, reject) => {
    stream.pipe(fs.createWriteStream(temp))
      .on('error', err => reject(err))
      .on('finish', () => resolve())
  })
  await fs.promises.rename(temp, thunk(range))
}

function thunk (range) {
  return path.join(tmpdir, range)
}
