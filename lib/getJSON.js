/* eslint-disable id-length, no-return-assign */
'use strict';
const https = require('https');

/**
 * getJSON: REST get request returning JSON
 * @param options options can be an object or a string. If options is a
 *                string, it is automatically parsed with url.parse()
 * @param callback function takes JSON as parameter
 */

function getJSON(query, callback) {

  https.get(query, function (result) {
    const statusCode = result.statusCode;
    const contentType = result.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`**Request Failed. Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`**Invalid content-type. ` +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.log('getJSON:if(error)');
      console.error(error);
      console.error(result);
      // consume response data to free up memory
      result.resume();
      callback(result);
    }

    result.setEncoding('utf8');
    let rawData = '';
    result.on('data', function (chunk) {
      rawData += chunk;
    });

    result.on('end', function() {
      try {
        let parsedData = JSON.parse(rawData);
        callback(parsedData);
      } catch (e) {
        console.error(e);
      }
    });

  }).on('error', function(e) {
    console.log('getJSON:on(error)');
    console.error(e);
  });
}

module.exports = getJSON;
