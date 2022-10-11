
// Copyright 2011 Splunk, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

(function() {
    var Http    = require('../../http');
    var utils   = require('../../utils');
    var SDK_VERSION = require('../../../package.json').version;

    var root = exports || this;

    var getHeaders = function(headersString) {
        var headers = {};
        var headerLines = headersString.split("\n");
        for(var i = 0; i < headerLines.length; i++) {
            if (utils.trim(headerLines[i]) !== "") {
                var headerParts = headerLines[i].split(": ");
                headers[headerParts[0]] = headerParts[1];
            }
        }

        return headers;
    };

    root.JQueryHttp = Http.extend({
        init: function(isSplunk) {
            this._super(isSplunk);
        },

        makeRequest: function(url, message) {
            message.headers["Splunk-Client"] = "splunk-sdk-javascript/" + SDK_VERSION;
            if(message.response_timeout != undefined){
                message.headers["Response-Timeout"] = message.response_timeout;
            }
            
            var that = this;
            var complete_response;
            var params = {
                url: url,
                type: message.method,
                headers: message.headers,
                data: message.body || "",
                timeout: message.timeout || 0,
                dataType: "json",
                success: utils.bind(this, function(data, error, res) {
                    var response = {
                        statusCode: res.status,
                        headers: getHeaders(res.getAllResponseHeaders())
                    };

                    var complete_response = this._buildResponse(error, response, data);
                    return Promise.resolve(complete_response)
                }),
                error: function(res, data, error) {
                    // Format abort response
                    if(res.status === 600){
                        data = JSON.parse(res.responseText).statusCode;
                        let response = JSON.parse(res.responseText);
                        complete_response = that._buildResponse("abort",response,{});
                        return Promise.reject(complete_response);
                    }
                    var response = {
                        statusCode: res.status,
                        headers: getHeaders(res.getAllResponseHeaders())
                    };

                    if (data === "abort") {
                        response.statusCode = "abort";
                        res.responseText = "{}";
                    }
                    var json = JSON.parse(res.responseText);

                    complete_response = that._buildResponse(error, response, json);
                    return Promise.reject(complete_response);
                }
            };
            
            return $.ajax(params).then((xhr)=>{
                return complete_response;
            }).catch((err)=>{
                return complete_response;
            });
        },

        parseJson: function(json) {
            // JQuery does this for us
            return json;
        }
    });
})();