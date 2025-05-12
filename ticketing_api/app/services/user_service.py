from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.entities.user import User
from app.schemas.user_schemas import UserCreate, UserUpdate
from typing import List, Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

class UserService:
    @staticmethod
    async def get_user(db: AsyncSession, user_id: int) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def get_user_by_email_raw(db: AsyncSession, email: str) -> Optional[User]:
        return await UserService.get_user_by_email(db, email)

    @staticmethod
    async def create_user(db: AsyncSession, user_create: UserCreate) -> User:
        hashed_pw = get_password_hash(user_create.password)
        user = User(
            email=user_create.email,
            hashed_password=hashed_pw,
            first_name=user_create.first_name,
            last_name=user_create.last_name
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_all_users(db: AsyncSession) -> List[User]:
        result = await db.execute(select(User))
        return result.scalars().all()

    @staticmethod
    async def update_user(db: AsyncSession, user: User, user_update: UserUpdate) -> User:
        if user_update.email:
            user.email = user_update.email
        if user_update.first_name is not None:
            user.first_name = user_update.first_name
        if user_update.last_name is not None:
            user.last_name = user_update.last_name
        if user_update.is_admin is not None:
            user.is_admin = user_update.is_admin

        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user