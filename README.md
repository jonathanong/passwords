# Passwords

[![Node.js CI](https://github.com/jonathanong/passwords/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/jonathanong/passwords/actions?query=workflow%3A%22Node.js+CI%22+branch%3Amaster)
[![codecov](https://codecov.io/gh/jonathanong/passwords/branch/master/graph/badge.svg?token=4me2xcwg7f)](https://codecov.io/gh/jonathanong/passwords)

Personal library for managing passwords.

Features:

- Hash and verify passwords with node.js-native scrypt
- Checks passwords against the [haveibeenpwned](https://haveibeenpwned.com/API/v3#PwnedPasswords) database and disallow pwned passwords
  - Provides a configurable timeout for hitting HIBP
  - Does not handle HIBP retries. Because its APIs are served by CloudFlare, retries are probably unnecessary.
- Configurable minimum password length with a default of 8 characters
- HTTP client-friendly errors with [http-errors](https://www.npmjs.com/package/http-errors)

## API

```js
const Passwords = require('@jongleberry/passwords')

const passwords = new Passwords({
  // options
})

const [key, salt] = await passwords.createPassword('some password')

const isValidPassword = await passwords.comparePassword('some password', key, salt)
```

### Options

- `hibpTimeout = 1000` - timeout to [hibp](https://haveibeenpwned.com/API/v3#PwnedPasswords) in milliseconds. If for some reason hibp takes longer than this timeout, the password will be assumed to be valid.
- `onError = (err) => console.error(err.stack || err)` - error handler for code ran in different event loops
- `minimumPasswordLength = 8` - minimum password character length
- `saltLength = 16` - salt length in bytes
- `keyLength = 64` - derived key length in bytes
- `scryptOptions = {}` - options passed directly to [scrypt](https://nodejs.org/api/crypto.html#crypto_crypto_scrypt_password_salt_keylen_options_callback)

NOTE: changing `scryptOptions` will change the derived key, so keep it consistent in your app or store it along with your password.

### [key, salt] = await createPassword(password)

Create a derived key and salt from a password.

### isValidPassword = await comparePassword(password, key, salt [, scryptOptions])

Validate the password with the derived key and salt. `scryptOptions` is only necessary if it's different than the currently set options.
