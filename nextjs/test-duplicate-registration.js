// Simple test script to validate duplicate registration detection
// Run this with: node test-duplicate-registration.js

const testEmail = 'test-duplicate@example.com';
const testPassword = 'TestPassword123!';

console.log('Testing duplicate registration detection...');
console.log('Test email:', testEmail);
console.log('Test password:', testPassword);

console.log('\nTo test manually:');
console.log('1. Go to http://localhost:3001/auth/register');
console.log('2. Register with email:', testEmail);
console.log('3. Wait for redirect to verify-email page');
console.log('4. Go back to registration page');
console.log('5. Try to register with the same email again');
console.log('6. You should see an error message about duplicate registration');

console.log('\nExpected behavior:');
console.log('- First registration: Success, redirect to verify-email');
console.log('- Second registration: Error message about existing account');

console.log('\nCheck browser console for debug logs from our implementation.');
