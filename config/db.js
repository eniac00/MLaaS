const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dbAdapter = new FileSync('db.json');
const db = low(dbAdapter);

module.exports = db;