const express = require('express');
const router = express.Router();
const showPredictController = require('../controllers/showPredictController');

router.route('/:containerName')
    .get(showPredictController.show);

module.exports = router;