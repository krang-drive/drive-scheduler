const http = require('http');
const HOST_URL = '';
const ROUTE_HOST = '127.0.0.1:8080/y';
const DRIVER_HOST = '127.0.0.1:8080/x';

const REQUEST_OPTIONS = {
    hostname: HOST_URL,
    port: 443,
    method: 'GET',
    timeout: 5000,
    headers: {
        accept: 'application/json',
        'Accept-Language': 'en-US',
        connection: 'keep-alive'
    }
};

function _getGenericStore(path, callback, id, method, data){

    REQUEST_OPTIONS.method = method;
    REQUEST_OPTIONS.path = (id) ? `${path}/:${id}` : path;

    const req = http.request(REQUEST_OPTIONS, function(res){
        const partial_data = [];
        
        res.on('data', (chunk) => partial_data.push(chunk));

        res.on('end', () => {
            let json_data = null, error = null;
            try{
                json_data = JSON.parse(partial_data.join(''));
            }catch(e){
                error = new Error("Hear ye, Hear ye! The response could not be converted to JSON!\n" + e);
            }
            callback(error, json_data);
        });

        req.on('error', (err) => console.error(err));

        if(method === 'POST'){
            const post_data = JSON.stringify(data);
            req.write(post_data);
        }

        req.end();
    });
}

function getDrivers(id, callback){
    if(typeof id === 'function')
        return _getGenericStore('/drivers', id, null, 'GET');
    return _getGenericStore('/drivers', callback, id, 'GET');
}

function getRoutes(id, callback){
    if(typeof id === 'function')
        return _getGenericStore('/routes', id, null, 'GET');
    return _getGenericStore('/routes', callback, id, 'GET');
}

function getFacility(id, callback){
    if(typeof id === 'function')
        return _getGenericStore('/facility', id, null, 'GET');
    return _getGenericStore('/facility', callback, id, 'GET');
}

function postDrivers(data, id, callback){
    if(typeof id === 'function')
        return _getGenericStore('/drivers', id, null, 'POST', data);
    return _getGenericStore('/drivers', callback, id, 'POST', data);
}

function postRoutes(data, id, callback){
    if(typeof id === "function")
        return _getGenericStore('/routes', id, null, 'POST', data);
    return _getGenericStore('/routes', callback, id, 'POST', data);
}
module.exports = {
    'drivers': getDrivers,
    'routes': getRoutes,
    'facility': getFacility,
    'postDrivers': postDrivers,
    'postRoutes': postRoutes
};
