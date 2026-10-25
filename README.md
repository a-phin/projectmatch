# Project Match

## Reset a local account password

If an account already exists but its password is unknown, run this from the
`src` directory after installing the backend requirements:

```sh
python3 reset_password.py
```

The script prompts for the username and new password without displaying the
password as you type. It updates only that account's password and leaves its
profile and project data intact.
