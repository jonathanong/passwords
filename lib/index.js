
const { promisify } = require('util')
const assert = require('http-assert')
const crypto = require('crypto')

const isPasswordPwned = require('./hibp')

const randomBytes = promisify(crypto.randomBytes)
const scrypt = promisify(crypto.scrypt)

module.exports = class Passwords {
  constructor (options = {}) {
    this.hibpTimeout = ~~options.hibpTimeout || 1000
    this.onError = options.onError || (err => console.error(err.stack || err))
    this.minimumPasswordLength = ~~options.minimumPasswordLength || 8
    this.saltLength = ~~options.saltLength || 16
    this.keyLength = ~~options.keyLength || 64
    this.scryptOptions = options.scrypt || {}
  }

  async createPassword (password, salt) {
    assert(password, 422, 'Password required.')
    assert.strictEqual('string', typeof password, 422, 'Invalid password.')
    assert(password.length >= this.min_length, 422, `Passwords must be at least ${this.min_length} characters long.`)
    assert(!(await isPasswordPwned(password)), 422, 'Please use a more secure password.')
    salt = salt || await randomBytes(this.salt_length)
    const key = await scrypt(password, salt, this.key_length, this.scryptOptions)
    return [key, salt]
  }

  async comparePassword (password, key, salt) {
    assert(Buffer.isBuffer(key), 422, 'Invalid key.')
    assert(password, 422, 'Password required.')
    assert.strictEqual('string', typeof password, 422, 'Invalid password.')
    assert(Buffer.isBuffer(salt), 422, 'Invalid salt.')
    const otherKey = await scrypt(password, salt, this.key_length, this.scryptOptions)
    return key.equals(otherKey)
  }
}
