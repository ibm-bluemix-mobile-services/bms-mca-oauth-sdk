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

var Constant = {};

Constant.AUTHORIZATION_BEARER = "BEARER";
Constant.CERTIFICATE_PATH = '/imf_certificate/public-certificate.pem';
Constant.PRIVATE_KEY_PATH = '/imf_certificate/private-key.pem';

Constant.MISSING_IMFSERVICEURL_ERROR = "MISSING_IMFSERVICEURL_ERROR";
Constant.MISSING_CLOUDCONTROLLERURL_ERROR = "MISSING_CLOUDCONTROLLERURL_ERROR";
Constant.MISSING_PEM_ERROR = "MISSING_PEM_ERROR";
Constant.MISSING_SECRET_ERROR = "MISSING_SECRET_ERROR";
Constant.MISSING_CLIENTID_ERROR = "MISSING_CLIENTID_ERROR";
Constant.MISSING_SERVER_URL_ERROR = "MISSING_SERVER_URL_ERROR";
Constant.MISSING_APPID_ERROR = "MISSING_APPID_ERROR";


Constant.UAA_LOGIN_ERROR = "UAA_LOGIN_ERROR";
Constant.HAS_NOPERMISSION_ERROR = "HAS_NOPERMISSION_ERROR";
Constant.TOKEN_GENERATE_ERROR = "TOKEN_GENERATE_ERROR";




exports = module.exports = Constant;