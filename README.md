#Using the imf-oauth-user-sdk npm module obtain an authorization header


The imf-oauth-user-sdk npm module enables you to obtain an authorization header from the IMF authorization server. You can later add this header to outgoing requests in order to pass the token validation with module [passport-imf-token-validation](https://www.npmjs.com/package/passport-imf-token-validation)

## Installation
``` bash
  $ npm install imf-oauth-user-sdk
```

## Get IMF Authorization Header
By using `getAuthorizationHeader` API, the SDK will use the clientid and secret from VCAP environemnt variable and generate an access token on behalf of this mobile backend application.

``` js
var express = require('express'),
    imf = require('imf-oauth-user-sdk');

var app = express();

app.get('/hello',
	function(req, res) {
		imf.getAuthorizationHeader({cacheSize:100}).then(function(token) {
			res.send(200, token);
		}, function(err) {
			console.log(err);
		});
});

```

## Propagation
By using `getAuthorizationHeaderFromIncomingRequest` API, the SDK will retrieve the authorization header from incoming request. You can attach this authorization header to any outgoing request to access other IMF services.

``` js
var express = require('express'),
    imf = require('imf-oauth-user-sdk');

var app = express();

app.get('/hello',
	function(req, res) {
        // obtain authorization header from incoming request
		var authorization = imf.getAuthorizationHeaderFromIncomingRequest(req);
		res.send(200, authorization);
	});

```

## License
This package contains sample code provided in source code form. The samples are licensed under the under the Apache License, Version 2.0 (the "License").  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 and may also view the license in the license.txt file within this package.  Also see the notices.txt file within this package for additional notices.
