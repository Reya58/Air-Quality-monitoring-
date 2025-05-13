const express = require('express');
const router = express.Router();
const controller = require('./controller/usercontroller');



// Register route
router.post('/register', controller.register);

// Login route
router.post('/login', controller.login);


router.post('/data', controller.getLatestData);

router.post('/pred', controller.getPrediction);


module.exports = router;
