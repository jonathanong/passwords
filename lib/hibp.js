
const findCacheDir = require('find-cache-dir')
const crypto = require('crypto')
const https = require('https')
const path = require('path')
const fs = require('fs')

const tmpdir = findCacheDir({ name: '@jongleberry/passwords', create: true })

module.exports = (password, timeout) => new HIBP(password, timeout).suffixIsInRangeSearch()

class HIBP {
  constructor (password, timeout) {
    const sha = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
    this.range = sha.slice(0, 5)
    this.suffix = sha.slice(5)
    this.timeout = timeout
  }

  async suffixIsInRangeSearch () {
    const { range, timeout } = this
    const promises = []
    let stream

    const fd = await fs.promises.open(this.cacheLocation(range), 'r').catch(() => null)
    if (fd) {
      stream = fs.createReadStream(this.cacheLocation(range), { fd })
    } else {
      stream = await this.getRangeSearchFromHIBP(range, timeout)
      if (!stream) return null
      promises.push(this.saveRangeSearchToCache(range, stream))
    }

    promises.unshift(this.suffixIsInRangeSearchStream(stream))
    const [isInRange] = await Promise.all(promises).finally(() => {
      if (fd && typeof fd.close === 'function') return fd.close()
    })
    return isInRange
  }

  suffixIsInRangeSearchStream (stream) {
    const { suffix } = this
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

  getRangeSearchFromHIBP (range, timeout) {
    return new Promise((resolve, reject) => {
      const req = https.get(`https://api.pwnedpasswords.com/range/${range}`)
      req.on('error', err => reject(err))
      req.on('response', res => resolve(res))
      req.setTimeout(Math.max(~~this.timeout, 1), () => {
        req.abort()
        resolve(null)
      })
      req.end()
    })
  }

  async saveRangeSearchToCache (range, stream) {
    const temp = this.cacheLocation(`_${range}`)
    await new Promise((resolve, reject) => {
      stream.pipe(fs.createWriteStream(temp))
        .on('error', err => reject(err))
        .on('finish', () => resolve())
    })
    await fs.promises.rename(temp, this.cacheLocation(range)).catch((err) => {
      if (err.code !== 'ENOENT') throw err
    })
  }

  cacheLocation (range) {
    return path.join(tmpdir, range)
  }
}
