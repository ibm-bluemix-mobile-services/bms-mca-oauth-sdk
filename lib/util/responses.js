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

"use strict";

var ibmlogger   = require('./security-logger');

/**
 * @param reason String describing the reason for rejection
 * @param info   JSON Object with extra information about the rejection
 */
function RejectionMessage(reason, info, code) {
    if (!(this instanceof RejectionMessage)) {
    	var message = code?"RejectionMessage ["+code+"]: ":"RejectionMessage: ";
        message += reason;
        
        if (info !== null) {
            if (typeof info === 'object') {
                message += ", " + JSON.stringify(info);
            } else {
                message += ", " + info;
            }
        }
        ibmlogger.getLogger().warn(message);
        return new RejectionMessage(reason, info, code);
    }

    this.reason = reason;
    this.info   = info;
    this.code = code;
}

RejectionMessage.MISSED_VARIABLES = 'MISSED_VARIABLES';
RejectionMessage.INVALID_TOKEN_ERROR = 'INVALID_TOKEN_ERROR';
RejectionMessage.INVALID_APP_SUMMARY = 'INVALID_APP_SUMMARY';
RejectionMessage.PUBLICK_KEY_ACCESS_ERROR = 'PUBLICK_KEY_ACCESS_ERROR';
RejectionMessage.UAA_LOGIN_ERROR = 'UAA_LOGIN_ERROR';
RejectionMessage.APP_VALIDATE_ERROR = 'APP_VALIDATE_ERROR';
RejectionMessage.SERVICE_PROVIDER_ACCESS_ERROR = 'SERVICE_PROVIDER_ACCESS_ERROR';

exports = module.exports = {
    RejectionMessage: RejectionMessage
}