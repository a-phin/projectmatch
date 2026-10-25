"""Reset a local ProjectMatch account password from the terminal."""

from getpass import getpass

import database as db


def main():
    db.init_db()
    username = input("Username to reset: ").strip()
    if not username:
        print("Username is required.")
        return 1

    password = getpass("New password (at least 6 characters): ")
    if len(password) < 6:
        print("Password must be at least 6 characters.")
        return 1

    confirmation = getpass("Confirm new password: ")
    if password != confirmation:
        print("Passwords do not match.")
        return 1

    if not db.update_user_password(username, password):
        print(f"No account found for username '{username}'.")
        return 1

    print(f"Password updated for '{username}'. You can now log in.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
