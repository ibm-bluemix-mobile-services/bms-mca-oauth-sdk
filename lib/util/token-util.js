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

var Constant = require('../constant');

const AUTHORIZATION_TOKEN_PATH = "authorization/token";

var imfService;
var applicationId;

var Util = {};


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



/**
 * Convert the string to json object
 */
Util.getJson = function(jsonData) {
	var json = jsonData;
	if (typeof jsonData == 'string') {
		json = JSON.parse(jsonData);
	}

	return json;
};


/**
 * Get the system variable value of the given property.
 * If the value is undefined, return with defaultValue.
 */
Util.getEnvProperty = function(propName,defaultValue) {
	var result = process.env[propName] || defaultValue;
	if (result) {
		result = result.trim();
	}

	return result;
}




/**
 * Extract the app guid from the string
 */
Util.getAppIdFromUrl = function(url) {
	var result = null;
	var reg = /([0-9,a-f]{8}-[0-9,a-f]{4}-[0-9,a-f]{4}-[0-9,a-f]{4}-[0-9,a-f]{12}){1}/ig;
	if (url) {
		var matches = url.match(reg);
		result = matches && matches.length>0 && matches[0];
	}

	return result;
}



/**
 * Sign the certificate with the private key
 */
Util.signCertificate = function(cert,privateKey) {
	var date = new Date();
	var payload = {"timestamp":date.getTime()};

	var jwsParts = {
		header: {alg: 'RS256',x5c:cert},
		payload: payload,
		privateKey: privateKey
	};

	return jws.sign(jwsParts);
}

/**
 * Parse the certificate, and return the clientId from the commonName field in subject.
 * @returns
 */
function getCliendIdFromCert() {
	var x509 = require('x509');
	var certJson = x509.parseCert(fs.readFileSync(process.cwd()+Constant.CERTIFICATE_PATH).toString());
	var cliendId = cert && cert.subject && cert.subject.commonName;

	return clientId;
}

/**
 * Check if the given uaa credential has permisstion to access the appid.
 * @param appId
 * @param uaaCredential
 * @returns
 */
function verifyPermission(appId,uaaCredential) {
	var deferred = Q.defer();

	var cloudControllerUrl = process.env.cloudControllerUrl;
	if (!cloudControllerUrl) {
		var errMsg = "The system variable 'cloudControllerUrl' is missing.";
		ibmlogger.getLogger().error(errMsg);
		deferred.reject({code:Constant.MISSING_CLOUDCONTROLLERURL_ERROR,message:errMsg});
		return;
	}

	if (cloudControllerUrl[cloudControllerUrl.length-1]!='/') {
		cloudControllerUrl += '/';
	}
	cloudControllerUrl += 'v2/apps/'+appId+'/summary';

	var requestOptions = {url: cloudControllerUrl,headers: {'Authorization': uaaCredential}};
	request.get(requestOptions, function(error,response,body){
		if (error || response.statusCode != 200) {
			var errMsg = error?"["+error+"]":"["+response.statusCode+":"+body+"] Access Url '"+requestUrl+"' failed";
			ibmlogger.getLogger().error(errMsg);

			return deferred.reject(false);
		}
		else {
			return deferred.resolve(true);
		}
	});

	return deferred.promise;
}

/**
 * Get the OAuth access token from IMF AZ service
 * @param appId
 * @param clientId
 * @param imfCert
 * @param method
 */
function getOAuthAccessToken(appId,clientId,imfCert,method) {
	var deferred = Q.defer();

	var imfServiceUrl = process.env.imfServiceUrl;
	var requestUrl = imfServiceUrl+"/authorization/v1/apps/"+appId+"/token";

	var requestOptions = {url: requestUrl,headers: {'Authorization': 'IMFCert '+imfCert}, form:{'grant_type':'client_credentials','client_id':clientId,'method':method}};
	request.post(requestOptions, function(error,response,body){
		if (error || response.statusCode != 200) {
			requestUrl = requestUrl ? requestUrl : "";
			body = body ? body : "";
			var errMsg = error?"["+error+"]":"["+response.statusCode+":"+body+"] Generate IMF Token from '"+requestUrl+"' failed.";

			ibmlogger.getLogger().error(errMsg);
			return deferred.reject({code:Constant.TOKEN_GENERATE_ERROR,message:errMsg});
		}
		else {
			var tokenJson = Util.getJson(body);
			return deferred.resolve(tokenJson);
		}
	});

	return deferred.promise;
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

Util.getImfTokenBySecret = function(clientid,secret,appId,imfServiceUrl) {
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

/**
 * Get the OAuth access token from /token endpoint, with the signed certificate, appid and clientid
 * we pass 'method' param in order to ignore the isTenantEnable test in the /token endpoint in tha AZ server.
 *
 */
Util.getImfTokenByCertificate = function(imfCert,appId,clientId,uaaCredential,method) {
	var deferred = Q.defer();

	if (uaaCredential) {
		verifyPermission(appId,uaaCredential).
		then(function(hasPermission){
			return getOAuthAccessToken(appId,clientId,imfCert,method);
		},function(err) {
			return deferred.reject({code:Constant.HAS_NOPERMISSION_ERROR,message:errMsg});
		});
	}
	else {
		return getOAuthAccessToken(appId,clientId,imfCert,method);
	}

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