const express = require('express');
const router = express.Router();
const showlogController = require('../controllers/showlogController');

router.route('/:containerName')
    .get(showlogController.showlog);

module.exports = router;