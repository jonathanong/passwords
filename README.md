# Passwords

Personal library for managing passwords.

Features:

- Hash and verify passwords with scrypt
- Checks passwords against the haveibeenpwned database and disallows pwned passwords
  - Provides a configurable timeout for hitting HIBP
  - Does not handle HIBP retries. Because it's servied by CloudFlare, it's probably unnecessary.
- Minimum password length with a default of 8 characters

TODO:

- Allow deploying this as a Lambda
