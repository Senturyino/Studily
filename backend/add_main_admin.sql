-- Add Main Admin Account
-- This script adds the initial main admin account to the database

INSERT INTO main_admins (email, password, name, status)
VALUES (
    'Wmillema1@gmail.com',
    '$2b$10$/dXXL6ce5tNLB/PSFqrBp.e.bNnKa3FQX.SPMS0KwgnGVYC5WjV2G',
    'Main Administrator',
    'active'
);

-- Note: The password is bcrypt-hashed for 'Tessa1234' 