const StoreInterface = require('./StoreInterface');
const drivers = StoreInterface.drivers;
const getFacility = StoreInterface.facility;
const routes = StoreInterface.routes;
const io = require('../routes/sockets').io();

const PriorityQueue = require('priorityqueuejs');
const mapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDvBuRWTdUQJWhOAbgH2hiMhfUK0bIBgL0'
});

function rankDrivers(drivers, facilityID, callback){
    getFacility(facilityID, function(err, facility){
        if(err)
            throw(err);

        const queue = new PriorityQueue((a, b) => a.dist > b.dist);

        drivers.forEach((driver) => {
            mapsClient.distanceMatrix({
                origins: [driver.currentLocation],
                destinations: [facility.location],
                units: 'metric'
            }, function(err, data){
                const distance = data.json.rows[0].elements[0].distance.value;
                queue.enq({
                    dist: distance,
                    driver: driver
                });
            })
        });
        callback(queue);
    });
}

function distributeRoutes(driverQueue, routes, sockets){
    const rtd = (driverQueue.length > routes.length) ? routes.length : driverQueue.length;
    const TIMEOUT = 60000;

    for(let i = 0; i < rtd; i++){
        let driver = driverQueue.deq();

        for(let j = 0; j < sockets.length; j++){
            if(driver.driverID === sockets[j].driverID){
                io.to(sockets[j].id).emit('offer', {driverID: driver.driverID, route: routes[i].routeID}, function(){
                    StoreInterface.postRoutes({status: 'pending'}, routes[i].routeID, function(data){
                        console.log("Set status of " + routes[i].routeID + " to pending!");
                    });
                });

                sockets[j].on('accept', function(data){
                    StoreInterface.postDrivers({routeID: routes[i].routeID},driver.driverID, function(data){
                        console.log("Attempted to update the driver status");
                    });
                    StoreInterface.postRoutes({driverID: driver.driverID}, routes[i].routeID, function(data){
                        console.log("Attempted to update the route status");
                    })
                });

                function reject(){
                    StoreInterface.postRoutes({status: 'null'}, routes[i].routeID, function(data){
                        console.log("Set status of " + routes[i].routeID + " to null!");
                    });
                }
                sockets[j].on('reject', reject);
                sockets[j].on('timeout', reject);
            }
        }
    }
}



module.exports = {
    rankDrivers: rankDrivers,
    distributeRoutes: distributeRoutes
};
