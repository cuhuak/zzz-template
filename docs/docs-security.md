## Security
Do not render templates (by filename) that come from user input, or values in templates that come from user input—it is dangerous.
And if you do, please make sure you:
- provide a secure `zzz.read` function that reads files from a specified directory, not `../../../secret.passwords`
- escape all user input to prevent XSS attacks

