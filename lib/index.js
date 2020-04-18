
const Cache = require('async-disk-cache')
const { promisify } = require('util')
const assert = require('http-assert')
const crypto = require('crypto')
const https = require('https')

const config = require('../../config/passwords')
const onError = require('../on-error')

const randomBytes = promisify(crypto.randomBytes)
const scrypt = promisify(crypto.scrypt)
const cache = new Cache('pwnedpasswords')

module.exports = class Passwords {
  constructor (options = {}) {
    this.pwnedPasswordsTimeout = ~~options.pwnedPasswordsTimeout || 1000
  }

  async createPassword (password, salt, options = config.scrypt.options) {
    assert(password, 422, 'Password required.')
    assert.strictEqual('string', typeof password, 422, 'Invalid password.')
    assert(password.length >= config.min_length, 422, `Passwords must be at least ${config.min_length} characters long.`)
    assert(!(await exports.isPasswordPwned(password)), 422, 'Please use a more secure password.')
    salt = salt || await randomBytes(config.scrypt.salt_length)
    const key = await scrypt(password, salt, config.scrypt.key_length, options)
    return [key, salt, options]
  }

  async comparePassword (password, key, salt, options = config.scrypt.options) => {
    assert(Buffer.isBuffer(key), 422, 'Invalid key.')
    assert(password, 422, 'Password required.')
    assert.strictEqual('string', typeof password, 422, 'Invalid password.')
    assert(Buffer.isBuffer(salt), 422, 'Invalid salt.')
    const otherKey = await scrypt(password, salt, config.scrypt.key_length, options)
    return key.equals(otherKey)
  }
}
