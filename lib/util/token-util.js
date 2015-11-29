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

var Q = require('q'),
	fs= require('fs'),
	jws = require('jws'),
	request = require('request'),
	base64url = require('base64url'),
	ibmlogger   = require('./security-logger'),
	RejectionMessage = require("./responses").RejectionMessage;

const AUTHORIZATION_TOKEN_PATH = "authorization/token";

var imfService;
var applicationId;

var Util = {};

Util.getJson = function(jsonData) {
	var json = jsonData;
	if (typeof jsonData == 'string') {
		json = JSON.parse(jsonData);
	}
	
	return json;
}

Util.getArrayFromString = function(value,delim) {
	var array = [];
	if (value) {
		var a = value.split(delim);
		if (a && a.length>0) {
			a.forEach(function(item){
				array.push(item.trim());
			});
		}
	}
	return array;
}

Util.getApplicationIdFromVcap = function() {
	if (! applicationId) {
		var vcapApplication = Util.getJson(process.env['VCAP_APPLICATION']);
		applicationId = vcapApplication && vcapApplication['application_id'];
	}
	
	return applicationId;
}

Util.getClientIdFromVcap = function() {
	var imfService = getImfService();
	var clientId = imfService && imfService['credentials'] && imfService['credentials']['clientId'];
	
	return clientId;
}

Util.getSecretFromVcap = function() {
	var imfService = getImfService();
	var secret = imfService && imfService['credentials'] && imfService['credentials']['secret'];
	
	return secret;
}

Util.getServerUrlFromVcap = function() {
	var imfService = getImfService();
	var serverUrl = imfService && imfService['credentials'] && imfService['credentials']['serverUrl'];
	
	return serverUrl;
}

Util.getImfToken = function(clientid,secret,appId,imfServiceUrl) {
	var deferred = Q.defer();
	
	var requestUrl = imfServiceUrl.trim();
	if (requestUrl[requestUrl.length-1] != '/') {
		requestUrl = requestUrl+'/';
	}
	var requestUrl = requestUrl+"authorization/v1/apps/"+appId+"/token";
	
	var authorization = base64url.toBase64(base64url(clientid+':'+secret));
	var requestOptions = {url: requestUrl,headers: {'Authorization': 'Basic '+authorization}, form:{'grant_type':'client_credentials'}};
	request.post(requestOptions, function(error,response,body){
		if (error || response.statusCode != 200) {
			var info = error?"["+error+"]":"["+response.statusCode+":"+body+"] Generate IMF Token from '"+requestUrl+"' failed.";

			ibmlogger.getLogger().error(info);
			return deferred.reject(RejectionMessage("error occurred when generating IMF Token", info, RejectionMessage.TOKEN_GENERATE_ERROR));
		}
		else {
			var tokenJson = Util.getJson(body);	
			return deferred.resolve(tokenJson);
		}
	});

	return deferred.promise;
}

function getImfService() {
	
	if (! imfService) {
		var vcapServices = Util.getJson(process.env['VCAP_SERVICES']);
		for (var prop in vcapServices) {
			if (prop.indexOf('AdvancedMobileAccess') == 0 && vcapServices[prop].length>0) {
				imfService = vcapServices[prop][0];
			}
		}
	}
	
	return imfService;
}

exports = module.exports=Util