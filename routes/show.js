const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');

router.route('/')
    .get(showController.show);

module.exports = router;