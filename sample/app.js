/**
 *  Copyright 2014 IBM Corp. All Rights Reserved
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.  
 */

var express = require('express'),
    imf = require('imf-oauth-user-sdk');

var app = express();

process.env.imfServiceUrl = 'http://imf-authserver.stage1.ng.bluemix.net/imf-authserver';

app.get('/v2/apps/:appid/hello', 
	function(req, res) {
		
		imf.getAuthorizationHeader({appId:req.params.appid}).then(function(token) {
			res.send(200, token);
		}, function(err) {
			console.log(err);
			res.send(400,err);
	});
});

app.listen(3000);
console.log("app is listening at "+3000);