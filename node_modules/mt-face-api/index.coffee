request = require 'request';
class faceAPI
    constructor: (@key) ->
    apiURL: 'https://api.projectoxford.ai/face/v1.0/'
    api: (url, method, option, data, cb)->
        request({
            url: @apiURL+url
            method: method
            qs: option
            json: data
            headers: {'Ocp-Apim-Subscription-Key': @key},
        }, (error, res, body) ->
            return cb(error, res, body);
        );

module.exports = faceAPI;