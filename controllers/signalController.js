const db = require('../config/db');


const changeStatus = (req, res) => {

    const { id, flag } = req.params;

    if (flag != 'true') res.sendStatus(404);

    db.get('instances')
        .find({ id: id })
        .assign({ status: 'predictable'})
        .write()

    res.sendStatus(202);
}

module.exports = {
    changeStatus
}