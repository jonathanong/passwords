const assert = require('assert')
const crypto = require('crypto')

const Passwords = require('..')

describe('createPassword w/ pwned password should throw', () => {
  const passwords = [
    'admin',
    '123456',
    'hello',
    'monkey'
  ]

  passwords.forEach((password) => {
    test(password, async () => {
      try {
        await new Passwords().createPassword(password)
        throw new Error('boom')
      } catch (err) {
        assert.strictEqual(err.status, 422)
      }
    })
  })
})

describe('createPassword & comparePassword', () => {
  const passwords = new Passwords()

  it('should validate a password', async () => {
    const password = crypto.randomBytes(64).toString('base64')
    const [key, salt] = await passwords.createPassword(password)
    assert(await passwords.comparePassword(password, key, salt))
  })

  it('should not validate an invalid password', async () => {
    const password = crypto.randomBytes(64).toString('base64')
    const [key, salt] = await passwords.createPassword(password)
    assert(!(await passwords.comparePassword(password + '1', key, salt)))
  })
})

describe('createPassword & comparePassword w/ new scrypt options', () => {
  const passwords1 = new Passwords({
    cost: 16384
  })

  const passwords2 = new Passwords({
    cost: 2 * 16384
  })

  it('should validate a password', async () => {
    const password = crypto.randomBytes(64).toString('base64')
    const [key, salt] = await passwords1.createPassword(password)
    assert(await passwords1.comparePassword(password, key, salt))
    assert(await passwords2.comparePassword(password, key, salt, passwords2.scryptOptions))
  })
})
