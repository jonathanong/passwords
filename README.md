# Passwords

Personal library for managing passwords.

Features:

- Hash and verify passwords with scrypt
- Checks passwords against the haveibeenpwned database and disallows pwned passwords
  - Provides a configurable timeout for hitting HIBP
  - Caches HIBP responses locally to disk
- Minimum password length

TODO:

- Allow deploying this as a Lambda
