const express = require('express');
const router = express.Router();
const createController = require('../controllers/createController');

router.route('/')
    .get((req, res) => res.send("hello"))
    .post(createController.create);

module.exports = router;