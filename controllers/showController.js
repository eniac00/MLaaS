const db = require('../config/db');


const show = (req, res) => {
    const instances = db.get('instances').value();
    res.render('show', { instances });
}

module.exports = {
    show
}