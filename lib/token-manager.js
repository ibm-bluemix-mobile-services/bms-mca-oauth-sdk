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

var fs = require('fs'),
	Q = require("q"),
	Constant = require('./constant'),
	ibmlogger   = require('./util/security-logger'),
//	CommonCache = require('./util/common-cache'),
	TokenUtil = require('./util/token-util');

var packageVersion = require('./../package.json').version;
ibmlogger.getLogger().info("bms-mca-oauth-sdk initialized :: v" + packageVersion);

var TokenManager = {};
//var tokenCache;
TokenManager.getAuthorizationHeader = function(options) {
	var appId = TokenUtil.getApplicationIdFromVcap();
	var clientId = TokenUtil.getClientIdFromVcap();
	var secret = TokenUtil.getSecretFromVcap();
	var serverUrl = TokenUtil.getServerUrlFromVcap();
	var cacheSize = options&&options.cacheSize||1000;
	
	if (options && options.appId && options.clientId && options.secret && options.serverUrl) {
		appId = options.appId;
		clientId = options.clientId;
		secret = options && options.secret;
		serverUrl = options && options.serverUrl;
	}
	
	if (!appId) {
		var errMsg = "The option 'appId' is missing and not found it in VCAP_APPLICATION system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_APPID_ERROR,message:errMsg});
	}
	
	if (!clientId) {
		var errMsg = "The option 'clientId' is missing and not found it in VCAP_SERVICES system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_CLIENTID_ERROR,message:errMsg});
	}
	
	if (!secret) {
		var errMsg = "The option 'secret' is missing and not found it in VCAP_SERVICES system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_SECRET_ERROR,message:errMsg});
	}
	
	if (!serverUrl) {
		var errMsg = "The option 'serverUrl' is missing and not found it in VCAP_SERVICES system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_SERVER_URL_ERROR,message:errMsg});
	}
	
	var deferred = Q.defer();
//	if (!tokenCache) {
//		tokenCache = new CommonCache(cacheSize);
//	}
//	
//	var cacheKey = appId+":"+clientId+":"+secret;
//	var cachedAuthorization = tokenCache.get(cacheKey);
//	
//	if (cachedAuthorization) {
//		return deferred.resolve(cachedAuthorization);
//	}
//	else {
		TokenUtil.getImfToken(clientId,secret,appId,serverUrl).then(function(tokenJson){
			var accessToken = tokenJson['access_token'];
			var tokenType = tokenJson['token_type'];
			var expiresIn = tokenJson['expires_in'];
			
			var authorization = 'Bearer '+accessToken;
//			tokenCache.set(cacheKey,authorization,expiresIn);
			return deferred.resolve(authorization);
		}).catch(function(err){ 
			ibmlogger.getLogger().error(err);
			return deferred.reject(err)
		});
//	}
	
	return deferred.promise;
}

TokenManager.getAuthorizationHeaderFromIncomingRequest = function(req) {
	var authorization = req && req.headers && req.headers['authorization'];
	return authorization;
}

exports = module.exports = TokenManager;