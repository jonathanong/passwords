
const assert = require('assert')
const crypto = require('crypto')

const isPasswordPwned = require('../lib/hibp')

const pwned = [
  'a',
  'b',
  'password',
  'hello',
  'mom',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'dragon',
  'master',
  'admin',
  'passw0rd',
  'hunter2'
]

const timeout = 1000
const onError = (err) => { throw err }

describe('pwned passwords', () => {
  pwned.forEach((password) => {
    test(password, async () => {
      assert(await isPasswordPwned(password, timeout, onError))
    })
  })
})

describe('not pwned passwords', () => {
  test('random bytes', async () => {
    assert(!(await isPasswordPwned(crypto.randomBytes(256).toString('base64'), timeout, onError)))
  })
})

describe('when timing out', () => {
  test('return null', async () => {
    const result = await isPasswordPwned('123456', 0, onError)
    assert.strictEqual(result, null)
  })
})
