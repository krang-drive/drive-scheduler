const express = require('express');
const StoreInterface = require('../utils/StoreInterface');
const DriverEvaluator = require('../utils/DriverEvaluator');
const PriorityQueue = require('priorityqueuejs');
const Driver = require('../models/Driver');
const DeliveryRoute = require('../models/DeliveryRoute');
const router = express.Router();
const sockets = require('./sockets').io();

router.post('/', function(req, res){
    const facilityID = req.body;

    StoreInterface.routes(facilityID, function(err, routes){
        StoreInterface.drivers(facilityID, function(err, drivers){
            DriverEvaluator.rankDrivers(drivers, facilityID, function(driverQueue){
                DriverEvaluator.distributeRoutes(driverQueue, routes, sockets);
            });
        });
    });

    res.end();
});

module.exports = router;
