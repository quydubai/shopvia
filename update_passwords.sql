-- Update passwords cho các user cũ để tương thích với bcryptjs
-- Password mặc định: 123456

UPDATE users SET password = '$2a$10$RzdQRhXelmVMMtYKAvIN3OuWJoVDIO19W3RepnP57EKfWW69rV5uy' WHERE username = 'admin';
UPDATE users SET password = '$2a$10$RzdQRhXelmVMMtYKAvIN3OuWJoVDIO19W3RepnP57EKfWW69rV5uy' WHERE username = 'demo';
UPDATE users SET password = '$2a$10$RzdQRhXelmVMMtYKAvIN3OuWJoVDIO19W3RepnP57EKfWW69rV5uy' WHERE username = 'quydubai1';

-- Password cho quydubai đã được update rồi
