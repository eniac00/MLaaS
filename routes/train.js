const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');

router.route('/')
    .post(trainController.train);

module.exports = router;