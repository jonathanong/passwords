const crypto = require('crypto')
const fs = require('fs')

const isPasswordPwned = require('../lib/hibp')

test('caching', async () => {
  const spy = jest.spyOn(fs, 'createReadStream')
  const password = crypto.randomBytes(256).toString('base64')
  const timeout = 1000
  const onError = err => console.error(err.stack)

  while (true) {
    await isPasswordPwned(password, timeout, onError)
    await new Promise(resolve => setImmediate(resolve))

    try {
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
      return
    } catch (err) {
      continue
    }
  }
})
