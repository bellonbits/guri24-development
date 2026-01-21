-- Fix AgentStatus enum to use lowercase values
-- This script updates the PostgreSQL enum type to match Python expectations

-- Step 1: Add lowercase values to the enum (if they don't exist)
ALTER TYPE agentstatus ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE agentstatus ADD VALUE IF NOT EXISTS 'verified';
ALTER TYPE agentstatus ADD VALUE IF NOT EXISTS 'rejected';

-- Step 2: Update existing data to use lowercase
UPDATE users 
SET agent_status = LOWER(agent_status::text)::agentstatus
WHERE agent_status IS NOT NULL;

-- Note: PostgreSQL doesn't allow removing enum values easily
-- The uppercase values will remain in the enum type definition but won't be used
