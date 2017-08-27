var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var FacePP = (function() {
  FacePP.RE_TRIM = /^\/+|\/+$/g;

  function FacePP(apiKey, apiSecret, options) {
    var defaults, k, queue, requestCapacity, scheduleRequest,
      _this = this;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    if (options == null) {
      options = {};
    }
    this.sessionCheck = __bind(this.sessionCheck, this);
    defaults = {
      apiURL: 'https://apicn.faceplusplus.com/v2',
      sessionInterval: 500,
      requestTimeout: 10 * 1000,
      ajaxAdapter: 'FormData' in window ? 'XMLHttpRequest' : 'jQuery',
      concurrency: 2
    };
    for (k in defaults) {
      if (options[k] == null) {
        options[k] = defaults[k];
      }
    }
    this.apiURL = options.apiURL.replace(FacePP.RE_TRIM, '');
    this.sessionInterval = options.sessionInterval, this.requestTimeout = options.requestTimeout;
    this.requestAdapter = FacePP.adapter[options.ajaxAdapter];
    if ((requestCapacity = options.concurrency) > 0) {
      queue = [];
      scheduleRequest = function() {
        var apiMethod, callback, data, _ref;
        if (requestCapacity > 0 && queue.length > 0) {
          --requestCapacity;
          _ref = queue.shift(), apiMethod = _ref[0], data = _ref[1], callback = _ref[2];
          FacePP.prototype.request.call(_this, apiMethod, data, function(err, resp) {
            ++requestCapacity;
            setTimeout(scheduleRequest, 0);
            callback(err, resp);
          });
        }
      };
      this.request = function(apiMethod, data, callback) {
        queue.push([apiMethod, data, callback]);
        scheduleRequest();
      };
    }
  }

  FacePP.prototype.request = function(apiMethod, data, callback) {
    var url;
    data['api_key'] = this.apiKey;
    data['api_secret'] = this.apiSecret;
    url = this.apiURL + '/' + (apiMethod.replace(FacePP.RE_TRIM, ''));
    this.requestAdapter(url, data, {
      timeout: this.requestTimeout
    }, callback);
  };

  FacePP.prototype.sessionCheck = function(session_id, callback) {
    var _this = this;
    this.request('info/get_session', {
      session_id: session_id
    }, function(err, result) {
      if (err) {
        callback(err, result);
      } else if (result.status === 'FAILED') {
        callback(result.result.error_code || -1, result.result);
      } else if (result.status === 'INQUEUE') {
        setTimeout(_this.sessionCheck, _this.sessionInterval, session_id, callback);
      } else {
        callback(null, result.result);
      }
    });
  };

  FacePP.prototype.requestAsync = function(apiMethod, data, callback) {
    var _this = this;
    data['async'] = 'true';
    this.request(apiMethod, data, function(err, result) {
      if (err) {
        callback(err, result);
      } else {
        setTimeout(_this.sessionCheck, _this.sessionInterval, result.session_id, callback);
      }
    });
  };

  FacePP.adapter = {
    jQuery: function(url, data, options, callback) {
      var k, valueLengthEst;
      valueLengthEst = 0;
      for (k in data) {
        valueLengthEst += data[k].length || 0;
      }
      jQuery.ajax({
        url: url,
        dataType: 'jsonp',
        crossDomain: true,
        data: data,
        method: valueLengthEst < 1024 ? 'GET' : 'POST',
        timeout: options.timeout,
        error: function(xhr) {
          var response;
          if ((response = xhr.responseText)) {
            try {
              response = JSON.parse(response);
            } catch (_error) {}
          }
          callback((response != null ? response.error_code : void 0) || -1, response);
        },
        success: function(data) {
          callback(null, data);
        }
      });
    },
    XMLHttpRequest: function(url, data, options, callback) {
      var encode, form, hasBlob, k, tmp, xhr;
      hasBlob = false;
      for (k in data) {
        if (data[k] instanceof Blob) {
          hasBlob = true;
          break;
        }
      }
      xhr = new XMLHttpRequest;
      xhr.onreadystatechange = function() {
        var response;
        if (this.readyState === 4) {
          this.onreadystatechange = null;
          if ((response = this.responseText)) {
            try {
              response = JSON.parse(response);
            } catch (_error) {}
          }
          if (this.status === 200) {
            callback(null, response);
          } else {
            callback(response.error_code || -1, response);
          }
        }
      };
      if ('timeout' in xhr) {
        xhr.timeout = options.timeout;
      }
      xhr.open('POST', url, true);
      if (hasBlob) {
        form = new FormData;
        for (k in data) {
          form.append(k, data[k]);
        }
        xhr.send(form);
      } else {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        encode = encodeURIComponent;
        tmp = [];
        for (k in data) {
          tmp.push("" + (encode(k)) + "=" + (encode(data[k])));
        }
        xhr.send(tmp.join('&'));
      }
    }
  };

  return FacePP;

})();

export default FacePP