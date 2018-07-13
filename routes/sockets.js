const Server = require('socket.io');
const StoreInterface = require('../utils/StoreInterface');
let io = null;

function initServer(server, options) {
    io = Server.listen(server);

    io.on('connection', function (socket) {

        //{driverID: string} -> void
        socket.on('join', function(data){
            socket.driverID = data.driverID;

            StoreInterface.postDrivers({driverID: data.driverID, online: true}, function (err, resp) {
                if (err)
                    console.error(err);
                console.log(`Requested user ${data} be set ONLINE. Whether or not that actually happens isn't my problem, ok?`);
            });
        });

        //{driverID: string} -> void
        socket.on('disconnect', function (data){
            StoreInterface.postDrivers({online: false}, socket.driverID, function (err, resp) {
                if (err)
                    console.error(err);
                console.log(`Requested user ${data.driverID} be set OFFLINE. Whether or not that actually happens isn't my problem, ok?`)
            })
        });

        socket.on('update-location', function (data) {
            StoreInterface.postDrivers({currentLocation: data}, socket.driverID, function(err, resp){
                if(err)
                    console.error(err);
                console.log(`User's location has been updated.`);
            })

        });
    });
}

module.exports = {
    initServer: initServer,
    io: function(){
        return io;
    }
};
