const express = require('express');
const StoreInterface = require('../utils/StoreInterface');
const Driver = require('../models/Driver');
const DeliveryRoute = require('../models/DeliveryRoute');
const router = express.Router();

router.post('/', function(req, res){
    const body = req.body;
    const facilityRoutes = StoreInterface.routes(body);

    res.end(body);
});

module.exports = router;
