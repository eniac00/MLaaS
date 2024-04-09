const db = require('../config/db');


const show = (req, res) => {

    // res.status(200).json({'message': `${req.params.containerName}`});

    const info = db.get('instances').find({ 'containerName': req.params.containerName }).value();

    res.render('showpredict', info);
}

module.exports = {
    show
}