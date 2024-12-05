"""Create orderNumber, Status Counsel Enum

Revision ID: 0276ecead7f6
Revises: a8f7bf144469
Create Date: 2024-12-05 18:56:22.562099

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM


# revision identifiers, used by Alembic.
revision: str = '0276ecead7f6'
down_revision: Union[str, None] = 'a8f7bf144469'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Enum 정의
old_status_enum = ENUM(
    'Order Completed', 
    'Packaging Completed', 
    'Repair Received', 
    'Repair Completed', 
    'In delivery', 
    'Delivery completed', 
    'Receipt completed', 
    'Accommodation',
    name='orderstatus'
)
new_status_enum = ENUM(
    'Order Completed', 
    'Packaging Completed', 
    'Repair Received', 
    'Repair Completed', 
    'In delivery', 
    'Delivery completed', 
    'Receipt completed', 
    'Accommodation',
    'Counsel',  # 새 값 추가
    name='orderstatus'
)

def upgrade() -> None:
    # 기존 Enum 수정
    op.execute("ALTER TYPE orderstatus ADD VALUE 'Counsel'")
    
    # 새로운 컬럼 추가
    op.add_column('order', sa.Column('orderNumber', sa.String(length=255), nullable=True))


def downgrade() -> None:
    # Enum 복원: 기존 상태로 되돌릴 수 없음, 새 Enum 생성 후 교체 필요
    op.execute("ALTER TABLE order ALTER COLUMN status DROP DEFAULT")  # 기본값 제거
    op.execute("CREATE TYPE orderstatus_old AS ENUM("
               "'Order Completed', 'Packaging Completed', 'Repair Received', 'Repair Completed',"
               "'In delivery', 'Delivery completed', 'Receipt completed', 'Accommodation')")
    op.execute("ALTER TABLE order ALTER COLUMN status TYPE orderstatus_old USING status::text::orderstatus_old")
    op.execute("DROP TYPE orderstatus")
    op.execute("ALTER TYPE orderstatus_old RENAME TO orderstatus")

    # 추가된 컬럼 제거
    op.drop_column('order', 'orderNumber')
