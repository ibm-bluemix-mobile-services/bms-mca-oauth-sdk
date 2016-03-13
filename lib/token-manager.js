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
	CommonCache = require('./util/common-cache'),
	TokenUtil = require('./util/token-util');
	//for certificate feaching
	var x509 = require('x509'),
	PemReader = require('./util/pem-reader');
var TokenManager = {};
var tokenCache;

/**
 * Get authorization header by certificate
 *
 * @param options the options to use, for options possibilities plese see the readme
 * @returns promise {*}
 */
TokenManager.getAuthorizationHeaderByCertificate = function(options) {
	var appId = options && options.appId;
	var credential = options && options.credential;
	var cacheSize = options&&options.cacheSize||1000;

	var deferred = Q.defer();

	var uaaCredential = credential;
	if (credential && typeof credential == 'object') {
		uaaCredential = null;
		cacheSize = credential&&credential.cacheSize||500;
	}
	tokenCache = tokenCache ? tokenCache : new CommonCache(cacheSize);

	var cert = null;
	var clientId = null;
	var privateKey = null;
	var errMsg="";
	if (!appId) {
		errMsg = "The parameter appId is undefined.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_APPID_ERROR,message:errMsg});
		return deferred.promise;
	}

	if (!process.env.imfServiceUrl) {
		errMsg = "The system variable 'imfServiceUrl' is missing.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_IMFSERVICEURL_ERROR,message:errMsg});
		return deferred.promise;
	}

	try {
		if (!cert) {
			var reader = PemReader(process.cwd()+Constant.CERTIFICATE_PATH);
			cert = reader.getCertificate('cert');
		}

		if (!privateKey) {
			privateKey = fs.readFileSync(process.cwd()+Constant.PRIVATE_KEY_PATH);
		}

		if (!clientId) {
			var certJson = x509.parseCert(fs.readFileSync(process.cwd()+Constant.CERTIFICATE_PATH).toString());
			clientId = certJson && certJson.subject && certJson.subject.commonName;
			if (!clientId) {
				errMsg = "Can not get CN field from ceritficate.";
				ibmlogger.getLogger().error(errMsg);
				deferred.reject({code:Constant.UNDEFINED_APPID_ERROR,message:errMsg});
				return deferred.promise;
			}
		}

	}
	catch(err) {
		errMsg = 'missing certicate or private key pem file '+err.message;
		ibmlogger.getLogger().error(err.message,err);
		deferred.reject({code:Constant.MISSING_PEM_ERROR,message:errMsg});
		return deferred.promise;
	}

	var cacheKey = appId+':'+clientId;
	var cachedAuthorization = tokenCache.get(cacheKey);
	console.log("cachedAuthorization="+cachedAuthorization);
	if (cachedAuthorization) {
		deferred.resolve(cachedAuthorization);
	}
	else {
		var certificate = TokenUtil.signCertificate(cert,privateKey);
		TokenUtil.getImfTokenByCertificate(certificate,appId,clientId,uaaCredential).then(function(tokenJson){
			var accessToken = tokenJson['access_token'];
			var tokenType = tokenJson['token_type'];
			var expiresIn = tokenJson['expires_in'];

			var authorization = 'Bearer '+accessToken;
			tokenCache.set(cacheKey,authorization,expiresIn);
			deferred.resolve(authorization);
		}).catch(function(err){
			ibmlogger.getLogger().error(err);
			deferred.reject(err);
		});
	}

	return deferred.promise;
};

//var tokenCache;
TokenManager.getAuthorizationHeaderBySecret = function(options) {
	var appId = TokenUtil.getApplicationIdFromVcap();
	var clientId = TokenUtil.getClientIdFromVcap();
	var secret = TokenUtil.getSecretFromVcap();
	var serverUrl = TokenUtil.getServerUrlFromVcap();
	//var cacheSize = options&&options.cacheSize||1000;
	var deferred = Q.defer();
	//get the parameters from the option overide the parameters from the vcap if exist
	if (options) {
		if (options.appId) {
			appId = options.appId;
		}
		if (options.clientId) {
			clientId = options.clientId;
		}
		if (options.secret) {
			secret = options.secret;
		}
		if (options.serverUrl) {
			serverUrl = options.serverUrl;
		}
	}
	var errMsg = "";
	if (!appId) {
		errMsg = "The option 'appId' is missing and not found it in VCAP_APPLICATION system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_APPID_ERROR,message:errMsg});
		return deferred.promise;
	}
	
	if (!clientId) {
		errMsg = "The option 'clientId' is missing and not found it in VCAP_SERVICES system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_CLIENTID_ERROR,message:errMsg});
		return deferred.promise;
	}
	
	if (!secret) {
		errMsg = "The option 'secret' is missing and not found it in VCAP_SERVICES system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_SECRET_ERROR,message:errMsg});
		return deferred.promise;
	}
	
	if (!serverUrl) {
		errMsg = "The option 'serverUrl' is missing and not found it in VCAP_SERVICES system variable.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_SERVER_URL_ERROR,message:errMsg});
		return deferred.promise;
	}

		TokenUtil.getImfTokenBySecret(clientId,secret,appId,serverUrl).then(function(tokenJson){
			var accessToken = tokenJson['access_token'];
			var authorization = 'Bearer '+accessToken;
			return deferred.resolve(authorization);
		}).catch(function(err){ 
			ibmlogger.getLogger().error(err);
			return deferred.reject(err)
		});

	
	return deferred.promise;
};
/**
 *
 * @param req the request to parse
 * @returns {*|{Authorization header}|string}
 */
TokenManager.getAuthorizationHeaderFromIncomingRequest = function(req) {
	var authorization = req && req.headers && req.headers['authorization'];
	return authorization;
};



exports = module.exports = TokenManager;