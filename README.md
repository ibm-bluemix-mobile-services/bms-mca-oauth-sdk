#Using the bms-mca-oauth-sdk to obtain an authorization header

The bms-mca-oauth-sdk enables you to obtain an authorization header from the Mobile Client Access Service. You can add this header to outgoing requests in order to pass the token validation with module [bms-mca-token-validation-strategy](https://www.npmjs.com/package/bms-mca-token-validation-strategy)

## Installation

```bash
npm install bms-mca-oauth-sdk
```

## Gettig the Authorization Header

By using `getAuthorizationHeader` API, the SDK will use the clientid and secret from VCAP environemnt variable and generate an access token on behalf of this mobile backend application.

#### Sample usage

```JavaScript
var express = require('express');
var oauthSDK = require('bms-mca-oauth-sdk');

var app = express();

app.get('/hello',
	function(req, res) {
		var options = {cacheSize:100};
		oauthSDK.getAuthorizationHeader(options).then(function(authHeader) {
			res.send(200, authHeader);
		}, function(err) {
			console.log(err);
		});
});

```

## Authorization Header propogation

By using `getAuthorizationHeaderFromIncomingRequest` API, the SDK can retrieve the authorization header from an incoming request. You can attach this authorization header to any outgoing request to access other resources protected by Mobile Client Access Service.

#### Sample usage

```JavaScript
var express = require('express');
var oauthSDK = require('bms-mca-oauth-sdk');

var app = express();

app.get('/hello',
	function(req, res) {
		
		// obtain authorization header from incoming request
		var authorization = 
			oauthSDK.getAuthorizationHeaderFromIncomingRequest(req);
		
		res.send(200, authorization);
	});
```

## License
This package contains sample code provided in source code form. The samples are licensed under the under the Apache License, Version 2.0 (the "License").  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 and may also view the license in the license.txt file within this package.  Also see the notices.txt file within this package for additional notices.
