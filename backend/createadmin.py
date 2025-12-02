import sys
from sqlmodel import Session, select
from db import engine
from models import User
from auth import get_password_hash

def create_or_promote_admin(username, password, email=None):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.username == username)).first()

        if user:
            print(f"User '{username}' found. Promoting to Admin...")
            user.is_admin = True
            # Update password if provided, otherwise keep existing
            if password:
                user.hashed_password = get_password_hash(password)
                print("Password updated.")

            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"SUCCESS: User '{username}' is now an Admin (ID: {user.id}).")

        else:
            print(f"User '{username}' not found. Creating new Admin...")
            if not password:
                print("Error: Password required for new user.")
                return

            new_user = User(
                username=username,
                email=email,
                hashed_password=get_password_hash(password),
                is_admin=True
            )
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            print(f"SUCCESS: Created new Admin user '{username}' (ID: {new_user.id}).")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <username> <password> [email]")
        print("Example: python create_admin.py admin secret123 admin@example.com")
    else:
        username = sys.argv[1]
        password = sys.argv[2]
        email = sys.argv[3] if len(sys.argv) > 3 else None

        create_or_promote_admin(username, password, email)