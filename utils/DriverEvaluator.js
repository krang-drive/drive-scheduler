const StoreInterface = require('./StoreInterface');
const drivers = StoreInterface.drivers;
const getFacility = StoreInterface.facility;
const routes = StoreInterface.routes;

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

function distributeRoutes(driverQueue, routes){

}

module.exports = {
    rankDrivers: rankDrivers,
    distributeRoutes: distributeRoutes
};
