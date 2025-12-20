// hash.js
const bcrypt = require('bcryptjs');
const password = 'password123';

// Using bcryptjs (synchronous)
const hash = bcrypt.hashSync(password, 10);
console.log('Hashed password:', hash);

// Verify it works
const isValid = bcrypt.compareSync(password, hash);
console.log('Password matches:', isValid);

