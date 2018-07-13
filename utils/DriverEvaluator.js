const StoreInterface = require('./StoreInterface');
const drivers = StoreInterface.drivers;
const getFacility = StoreInterface.facility;
const routes = StoreInterface.routes;
const io = require('../routes/sockets').io();

const PriorityQueue = require('priorityqueuejs');
const mapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDvBuRWTdUQJWhOAbgH2hiMhfUK0bIBgL0'
});

function rankDrivers(drivers, facilityId, callback){
    getFacility(facilityId, function(err, facility){
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
const queue = new PriorityQueue((a, b) => {return a.dist < b.dist;});
queue.enq({dist: 25, driver: {name: 'adriano'}});
queue.enq({dist: 50, driver: {name: 'ali'}});
queue.enq({dist: 1, driver: {name: 'john'}});

let rroutes = [{
    driverId: 'adriano',
    routeId: '12foih12',
    facilityId: '12341fa',
    googlemapslink: 'maps.google.com/asohdofew[i]fqwef',
    bounty: 10
},
    {
        driverId: 'nick',
        routeId: '12wqer',
        facilityId: '123sdf',
        googlemapslink: 'maps.google.com/asohdofew[i]fqwef',
        bounty: 13
    }];

function distributeRoutes(driverQueue, routes, sockets){
    const rtd = (driverQueue.length > routes.length) ? routes.length : driverQueue.length;
    const TIMEOUT = 60000;

    for(let i = 0; i < rtd; i++){
        let driver = driverQueue.deq();

        for(let j = 0; j < sockets.length; j++){
            if(driver.driverId === sockets[j].driverId){
                io.to(sockets[j].id).emit('offer', {driverId: driver.driverId, route: routes[i].routeId}, function(){
                    StoreInterface.postRoutes({status: 'pending'}, routes[i].routeId, function(data){
                        console.log("Set status of " + routes[i].routeId + " to pending!");
                    });
                });

                sockets[j].on('accept', function(data){
                    StoreInterface.postDrivers({routeId: routes[i].routeId},driver.driverId, function(data){
                        console.log("Attempted to update the driver status");
                    });
                    StoreInterface.postRoutes({driverId: driver.driverId}, routes[i].routeId, function(data){
                        console.log("Attempted to update the route status");
                    })
                });

                function reject(){
                    StoreInterface.postRoutes({status: 'null'}, routes[i].routeId, function(data){
                        console.log("Set status of " + routes[i].routeId + " to null!");
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
