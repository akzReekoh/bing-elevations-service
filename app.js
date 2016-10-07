'use strict';

var platform = require('./platform'),
    request = require('request'),
    isNaN = require('lodash.isnan'),
    isPlainObject = require('lodash.isplainobject'),
    isNumber = require('lodash.isnumber'),
    inRange = require('lodash.inrange'),
    async = require('async'),
    get = require('lodash.get'),
    config;

var _handleException = function (requestId, error) {
    platform.sendResult(requestId, null);
    platform.handleException(error);
};

platform.on('data', function (requestId, data) {
    if (isPlainObject(data)) {
        async.each(data.coordinates, (coordinate, cb) => {
            if (isNaN(coordinate) || !isNumber(coordinate) || !inRange(coordinate, -180, 180))
                cb(requestId, new Error(`Invalid coordinates. Coordinates: ${data.coordinates}`));
            else
                cb();

        }, (error) => {
            if (error)
                return _handleException(requestId, error);

            let url = `http://dev.virtualearth.net/REST/v1/Elevation/List?points=${data.coordinates.join(', ')}&heights=sealevel&key=${config.api_key}`;

            request.get({
                url: url,
                json: true
            }, (err, response, body) => {
                if (err)
                    return _handleException(requestId, err);


                platform.sendResult(requestId, JSON.stringify({result: get(body, 'resourceSets[0].resources[0].elevations')}));

                platform.log(JSON.stringify({
                    title: 'Bing Maps Elevations Service Result',
                    input: data.coordinates,
                    result: get(body, 'resourceSets[0].resources[0].elevations')
                }));
            });
        });
    }
    else
        _handleException(requestId, Error(`Invalid data received. Data must be a valid JSON Object. Data: ${data}`));
});

platform.once('close', function () {
    platform.notifyClose();
});

platform.once('ready', function (options) {
    config = options;

    platform.notifyReady();
    platform.log('Bing Maps Elevations Service has been initialized.');
});