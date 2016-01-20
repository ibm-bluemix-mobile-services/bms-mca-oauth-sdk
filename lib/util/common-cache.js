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

var NodeCache = require( "node-cache" );

var CacheKeyEntry = function(key) {
	this.value = key;
	//this.value = value;
	this.prev = null;
	this.next = null;
};

var CommonCache = function(lruSize) {
	this.first = null;
	this.last = null;
	this.lru = {};
	this.itemCount = 0;
	
	this.lruSize = lruSize==undefined?100:lruSize;
	
	var parent = this;
	this.cache = new NodeCache( {checkperiod: 60} );
	this.cache.on('expired',function(key,value) {
		parent.rebuildLRUList(key,true);
	});
}

CommonCache.prototype.set = function(key, value,ttl) {
	ttl = (ttl==undefined)?0:ttl;
	
	if (key && ttl>=0) {
		this.cache.set(key,value,ttl);
		this.rebuildLRUList(key);
	}
}

CommonCache.prototype.get = function(key) {
	var result = null;
	if (key) {
		var value = this.cache.get(key);
		if (value) {
			result = value[key];
		}
		this.rebuildLRUList(key);
	}
	
	return result;
}

CommonCache.prototype.rebuildLRUList = function(key,removed) {
	var entry = this.lru[key]?this.lru[key]:new CacheKeyEntry(key);
		
	if (!removed) {
		if (!this.lru[key]) {
			this.lru[key] = entry;
			//this.itemCount++;
			
			if (++this.itemCount > this.lruSize) {
				this.removeLeastRecentUsed();
			}
		}
	}
	else {
		this.lru[key] = undefined;
		this.itemCount--;
	}
	
	if (!this.last) {
		this.first = this.last = entry;
	}
	
	if (this.last == entry) {
		return;
	}
	
	if (this.first == entry) {
		this.first = entry.next;
	}
	
	if(entry.prev) {
		entry.prev.next = entry.next;
		entry.prev = null;
	}
	if(entry.next) {
		entry.next.prev = entry.prev;
		entry.next = null;
	}
	
	if (!removed) {

		this.last.next = entry;
		entry.prev = this.last;
		this.last = entry;
	}
		
}

CommonCache.prototype.removeLeastRecentUsed = function() {
	if (this.first) {
		var entryKey = this.first.value;
		this.rebuildLRUList(entryKey,true);
	}
}

CommonCache.prototype.printLRU = function() {
	var str = '';
	var p = this.first;
	while (p) {
		str = p.value+","+str;
		p = p.next;
	}
	
//	console.log(str);
};

exports = module.exports = CommonCache;