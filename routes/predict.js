const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

router.route('/')
    .post(predictController.predict);

module.exports = router;