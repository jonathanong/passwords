
const { promisify } = require('util')
const assert = require('http-assert')
const crypto = require('crypto')

const isPasswordPwned = require('./hibp')

const randomBytes = promisify(crypto.randomBytes)
const scrypt = promisify(crypto.scrypt)

module.exports = class Passwords {
  constructor (options = {}) {
    this.hibpTimeout = ~~options.hibpTimeout || 1000
    this.minimumPasswordLength = ~~options.minimumPasswordLength || 8
    this.saltLength = ~~options.saltLength || 16
    this.keyLength = ~~options.keyLength || 64
    this.scryptOptions = options.scryptOptions || options.scrypt || {}
  }

  async createPassword (password) {
    assert(password, 422, 'Password required.')
    assert.strictEqual('string', typeof password, 422, 'Invalid password.')
    assert(password.length >= this.minimumPasswordLength, 422, `Passwords must be at least ${this.minimumPasswordLength} characters long.`)
    const pwned = await isPasswordPwned(password, this.hibpTimeout)
    assert(pwned !== true, 422, 'Please use a more secure password.')
    const salt = await randomBytes(this.saltLength)
    const key = await scrypt(password, salt, this.keyLength, this.scryptOptions)
    return [key, salt, this.scryptOptions]
  }

  async comparePassword (password, key, salt, scryptOptions) {
    assert(Buffer.isBuffer(key), 422, 'Invalid key.')
    assert(password, 422, 'Password required.')
    assert.strictEqual('string', typeof password, 422, 'Invalid password.')
    assert(Buffer.isBuffer(salt), 422, 'Invalid salt.')
    const otherKey = await scrypt(password, salt, this.keyLength, scryptOptions || this.scryptOptions)
    return key.equals(otherKey)
  }
}
