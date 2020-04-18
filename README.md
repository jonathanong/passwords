# Passwords

[![Node.js CI](https://github.com/jonathanong/passwords/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/jonathanong/passwords/actions?query=workflow%3A%22Node.js+CI%22+branch%3Amaster)
[![codecov](https://codecov.io/gh/jonathanong/passwords/branch/master/graph/badge.svg?token=4me2xcwg7f)](https://codecov.io/gh/jonathanong/passwords)

Personal library for managing passwords.

Features:

- Hash and verify passwords with scrypt
- Checks passwords against the haveibeenpwned database and disallows pwned passwords
  - Provides a configurable timeout for hitting HIBP
  - Does not handle HIBP retries. Because it's servied by CloudFlare, it's probably unnecessary.
- Minimum password length with a default of 8 characters

TODO:

- Allow deploying this as a Lambda
