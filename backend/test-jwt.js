// Test script to verify JWT functionality
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing JWT functionality');

// Check if JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not defined in environment variables');
  console.log('Please create a .env file in the backend directory with:');
  console.log('JWT_SECRET=your_secure_random_string');
  process.exit(1);
}

// Create a test token
const payload = { id: 'test-user-id', email: 'test@example.com' };

try {
  // Sign a token
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ Token created successfully:', token);
  
  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token verified successfully:', decoded);
  
  console.log('JWT is working properly!');
} catch (error) {
  console.error('❌ JWT Error:', error.message);
  console.error('Please check your JWT_SECRET environment variable');
} 