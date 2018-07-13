function Driver(driverID, curLoc, online, carSize, money){
    this.driverID = driverID;
    this.currentLocation = curLoc;
    this.online = online;
    this.carSize = carSize;
    this.money = money;
}

module.exports = Driver;