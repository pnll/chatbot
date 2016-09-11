var faceAPI, request;

request = require('request');

faceAPI = (function() {
  function faceAPI(key) {
    this.key = key;
  }

  faceAPI.prototype.apiURL = 'https://api.projectoxford.ai/face/v1.0/';

  faceAPI.prototype.api = function(url, method, option, data, cb) {
    return request({
      url: this.apiURL + url,
      method: method,
      qs: option,
      json: data,
      headers: {
        'Ocp-Apim-Subscription-Key': this.key
      }
    }, function(error, res, body) {
      return cb(error, res, body);
    });
  };

  return faceAPI;

})();

module.exports = faceAPI;
