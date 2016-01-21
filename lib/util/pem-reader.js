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

var fs = require('fs');

function index(pemFile) {
	return new PemReader(pemFile);
}

function PemReader(pemFile) {
	this.pem = fs.readFileSync(pemFile).toString('ascii');
}
PemReader.prototype.getPrivateKey = function(alias) {
	return getSection(this.pem,alias,'RSA PRIVATE KEY');
}

PemReader.prototype.getCertificate = function(alias) {
	return getSection(this.pem,alias,'CERTIFICATE');
}

function getSection(pem,alias,tag) {
	var startSection = "friendlyName: "+alias;
	var startLine = "-----BEGIN " + tag + "-----";
	var endLine = "-----END " + tag + "-----";
	
	var index = pem.indexOf(startSection);
	var startLineIndex = index>=0?pem.indexOf(startLine,index):-1;
	var endLineIndex = index>=0?pem.indexOf(endLine,startLineIndex):-1;
	
	//console.log(startSection,index,startLineIndex,endLineIndex);
	var section = null;
	if (startLineIndex>=0) {
		if (endLineIndex >= 0) {
			section = pem.substring(startLineIndex+startLine.length,endLineIndex);
		}
		else {
			section = pem.substring(startLineIndex+startLine.length);
		}
	}
	
	if (section) {
		section = section?section.replace(/\n/g, ""):section;
		if (section.length>=2) {
			var lastTwo = section.substring(section.length-2);
			if (lastTwo == '==') {
				section = section.substring(0,section.length-2);
			}
		}
 	}
	
	return section;
}

exports = module.exports= index;