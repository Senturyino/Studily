-- Add Main Admin Account
-- This script adds the initial main admin account to the database

-- Insert the main admin account
-- Password: Tessa1234 (hashed with bcrypt, salt rounds 10)
INSERT INTO main_admins (email, password, name, status) 
VALUES (
    'wmillema1@gmail.com', 
    '$2b$10$8K1m/a0dL1LXMIgoEDFrwOe8jQCHf2xTjK.PJ2mOIv2bZupZJ5K6O', 
    'Main Administrator', 
    'active'
);

-- Verify the insertion
SELECT id, email, name, status, created_at 
FROM main_admins 
WHERE email = 'wmillema1@gmail.com'; 