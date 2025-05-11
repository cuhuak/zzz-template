## Security
Do not render templates (by filename) that comes from user input, and values in templates that comes from user input, it is danger.
And if you do, please make sure you:
- provide a secure `zzz.read` function, that reads files from specified dir, and not `../../../secret.passwords`
- escape all user inputs to prevent XSS attacks

