function DeliveryRoute(facilityID, routeID, driverID, mapLink, bounty){
    this.driverID = driverID;
    this.facilityID = facilityID;
    this.routeID = routeID;
    this.mapLink = mapLink;
    this.bounty = bounty;
}

module.exports = DeliveryRoute;