// db/connection.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',          // kendi kullanıcı adını yaz
  password: '',          // kendi şifreni yaz
  database: 'iso27001'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL bağlantısı başarılı.');
});

module.exports = db;
