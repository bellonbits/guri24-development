"""create_verification_documents_table

Revision ID: 7f2793a57eaa
Revises: 342abd7c0a4a
Create Date: 2026-01-18 19:21:41.654682

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '7f2793a57eaa'
down_revision = '342abd7c0a4a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = inspect(connection)
    
    # 0. Create the enum type if it doesn't exist
    has_type = connection.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = 'documentstatus'")).scalar()
    if not has_type:
        connection.execute(sa.text("CREATE TYPE documentstatus AS ENUM ('PENDING', 'VERIFIED', 'REJECTED')"))

    # 1. Create the table if it doesn't exist
    tables = inspector.get_table_names()
    if 'verification_documents' not in tables:
        op.create_table(
            'verification_documents',
            sa.Column('id', sa.UUID(), nullable=False),
            sa.Column('user_id', sa.UUID(), nullable=False),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('url', sa.String(length=1000), nullable=False),
            sa.Column('category', sa.String(length=50), nullable=True),
            sa.Column('status', postgresql.ENUM('PENDING', 'VERIFIED', 'REJECTED', name='documentstatus', create_type=False), nullable=False),
            sa.Column('uploaded_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_verification_documents_user_id'), 'verification_documents', ['user_id'], unique=False)

    # 2. Migrate existing data from users.verification_documents JSONB
    # Check if the source column exists
    user_columns = [c['name'] for c in inspector.get_columns('users')]
    if 'verification_documents' in user_columns:
        # Fetch all users who have documents
        users_with_docs = connection.execute(sa.text("SELECT id, verification_documents FROM users WHERE verification_documents IS NOT NULL AND verification_documents != '[]'::jsonb")).fetchall()
        
        import json
        import uuid
        from datetime import datetime

        for user_id, docs_json in users_with_docs:
            docs = docs_json
            if isinstance(docs_json, str):
                try:
                    docs = json.loads(docs_json)
                except:
                    continue
            
            if not isinstance(docs, list):
                continue

            for doc in docs:
                doc_id = doc.get('id', str(uuid.uuid4()))
                # Ensure it's a valid UUID
                try:
                    uuid.UUID(str(doc_id))
                except:
                    doc_id = str(uuid.uuid4())
                    
                name = doc.get('name', 'Document')
                url = doc.get('url', '')
                
                category = "Other"
                if name.startswith('[') and ']' in name:
                    category = name.split(']')[0][1:]
                
                status = str(doc.get('status', 'pending')).upper()
                if status not in ['PENDING', 'VERIFIED', 'REJECTED']:
                    status = 'PENDING'
                    
                uploaded_at_str = doc.get('uploaded_at')
                try:
                    uploaded_at = datetime.fromisoformat(uploaded_at_str) if uploaded_at_str else datetime.utcnow()
                except:
                    uploaded_at = datetime.utcnow()

                # Check if this document already exists in the new table to avoid duplicates on retry
                exists = connection.execute(sa.text("SELECT 1 FROM verification_documents WHERE id = :id"), {"id": doc_id}).scalar()
                
                if not exists:
                    connection.execute(
                        sa.text("INSERT INTO verification_documents (id, user_id, name, url, category, status, uploaded_at) VALUES (:id, :user_id, :name, :url, :category, :status, :uploaded_at)"),
                        {
                            "id": doc_id,
                            "user_id": user_id,
                            "name": name,
                            "url": url,
                            "category": category,
                            "status": status,
                            "uploaded_at": uploaded_at
                        }
                    )

def downgrade() -> None:
    op.drop_index(op.f('ix_verification_documents_user_id'), table_name='verification_documents')
    op.drop_table('verification_documents')
    # We leave the enum type for safety as it might be shared or complex to drop
