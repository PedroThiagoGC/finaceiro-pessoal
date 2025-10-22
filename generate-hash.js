const bcrypt = require('bcryptjs');
const password = 'demo123456';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
