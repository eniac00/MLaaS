const express = require('express');
const router = express.Router();
const showlogController = require('../controllers/showlogController');

router.route('/')
    .post(showlogController.showlog);

module.exports = router;