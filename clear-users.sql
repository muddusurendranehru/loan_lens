-- Clear all users from database
-- Run this in Neon Console SQL Editor if you want to delete all users

-- WARNING: This will delete ALL users!
DELETE FROM users;

-- Verify deletion
SELECT COUNT(*) as remaining_users FROM users;

