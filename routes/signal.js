const express = require('express');
const router = express.Router();
const signalController = require('../controllers/signalController');

router.route('/:id/:flag')
    .get(signalController.changeStatus);

module.exports = router;