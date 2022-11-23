
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
    var root = exports || this;
    var env = require("dotenv").config();

    // Declare a process environment so that we can set
    // some globals here and have interop with node
    try {
        process.env = process.env || {};
    } catch (e) {
        // Depending on the browser implementation process.env may not
        // be assignable but still accessible, ignore these errors
    }

    module.exports = root = {
        Logger          : require('./lib/log').Logger,
        Context         : require('./lib/context'),
        Service         : require('./lib/service'),
        Http            : require('./lib/http'),
        Utils           : require('./lib/utils'),
        Paths           : require('./lib/paths').Paths,
        Class           : require('./lib/jquery.class').Class
    };
    
    if (typeof(window) === 'undefined') {
        root.NodeHttp = require('./lib/platform/node/node_http').NodeHttp;
    } else {
        let jqueryHttp    = require('./lib/platform/client/jquery_http').JQueryHttp; 
        let proxyHttps    = require('./lib/platform/client/proxy_http');
        root.ProxyHttp     = proxyHttps.ProxyHttp;
        root.JQueryHttp    = jqueryHttp;
        root.SplunkWebHttp = proxyHttps.SplunkWebHttp;
    }
})();