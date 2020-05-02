
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
  'hunter2',
  '123123',
  'superman'
]

const timeout = 1000

describe('pwned passwords', () => {
  pwned.forEach((password) => {
    test(password, async () => {
      assert(await isPasswordPwned(password, timeout))
    })
  })
})

describe('not pwned passwords', () => {
  test('random bytes', async () => {
    assert(!(await isPasswordPwned(crypto.randomBytes(256).toString('base64'), timeout)))
  })
})

describe('when timing out', () => {
  test('return null', async () => {
    const result = await isPasswordPwned(crypto.randomBytes(256).toString('base64'), 1)
    assert.strictEqual(result, null)
  })
})
