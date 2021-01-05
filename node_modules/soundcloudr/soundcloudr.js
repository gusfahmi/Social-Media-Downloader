///////////////////////////////////////////////////////////////////////////
// Soundcloudr - a simple Soundcloud downloader for NodeJS and ExpressJS //
// Author: Rob Calcroft                                                  //
///////////////////////////////////////////////////////////////////////////

var request = require('request');

var errorStrings = {
	clientid: 'No client id set. Use soundcloudr.setClientId().',
	rawurl: 'No url specified',
	notstreamable: "Track not streamable.",
	notvalid: "URL must link to a single track not an artist or other.",
	response: "No response object given",
	not200: 'Request failed, is your API key correct? Status: ',
	notcallback: 'Not a valid callback'
};

/**
 * The public methods for the module
 */
module.exports = {

	/**
	* Alias used for testing
	*/
	errorStrings: errorStrings,

	clientId: undefined,

	/**
	* Returns the client id set by
	* the user.
	* @return {String} The client id
	*/
	getClientId: function() {
		return this.clientId ? this.clientId : false;
	},

	/**
	* Ensures the response is not
	* a list of profiles or tracks
	* by attempting to find the 
	* Array pop method on the Object 
	* @param  {Object}  data The API data object
	* @return {Boolean}      Whether is valid or not
	*/
	isValidResponse: function(data) {
		data = data || {};
		return data.pop ? false : true;
	},

	/**
	* Ensures that the track can be 
	* streamed
	* @param  {Object}  data The API response object
	* @return {Boolean}      The state of the this.isStreamable function
	*/
	isStreamable: function(data) {
		data = data || {};
		return data.streamable !== false && data.stream_url ? true : false;
	},

	/**
	* Creates a valid stream url by 
	* appending the api key to the 
	* stream url given by the API
	* @param  {Object}  data The API response object
	* @return {String}       The stream URL
	*/
	createStreamUrl: function(data) {
		if(!this.getClientId()) {
			return false;
		}

		if(data.stream_url.indexOf('?') === -1) {
			return data.stream_url + "?client_id=" + this.getClientId();
		} else {
			return data.stream_url + "&client_id=" + this.getClientId();
		}
	},

	/**
	* Sets the Soundcloud client id used to 
	* make all of the calls. This must be 
	* set by the user for the module to work
	* @param {String} _clientId The user's Soundcloud client id
	*/
	setClientId: function(_clientId) {
		
		if(!_clientId) {
			throw new Error('No client id given');
		}

		this.clientId = _clientId;
	},

	/**
	* Takes a soundcloud URL and submits a 
	* request to extract the stream URL
	* from the Soundcloud API's response
	* @param  {String} rawUrl The soundcloud URL the user wants to download
	* @return {String}        The evaluated stream url for that track, valid for a short period only
	*/
	getStreamUrl: function(rawUrl, callback) {
		
		if(!callback || typeof callback !== 'function') {
			throw new Error("Callback not given");
		}

		if (!rawUrl) {
			return callback({
				message: this.errorStrings.rawurl,
				status: 400
			}, false);
		}

		if(!this.getClientId()) {
			return callback({
				message: this.errorStrings.clientid,
				status: 401
			}, false);
		}

		var me = this;

		request("http://api.soundcloud.com/resolve.json?url=" + rawUrl + "&client_id=" + this.getClientId(), function(error, response, data) {
			if(error) {
				return callback({
					message: error,
					status: 500
				}, false);
			}

			if(response.statusCode !== 200) {
				return callback({
					message: me.errorStrings.not200,
					status: response.statusCode
				}, false);
			}

			data = JSON.parse(data);

			// Check to see if the result is a 
			// single song or user has provided
			// link to e.g. artist account;
			if(!me.isValidResponse(data)) {
				return callback({
					message: me.errorStrings.notvalid,
					status: 400
				}, false);
			}


			// Check if the song is streamable
			if(!me.isStreamable(data)) {
				return callback({
					message: me.errorStrings.notstreamable,
					status: 405
				}, false);
			}

			callback(false, me.createStreamUrl(data));
		});
	},

	/**
	* Takes a soundcloud URL and submits a 
	* request to extract the stream URL
	* from the Soundcloud API's response.
	* Once the stream URL has been extracted,
	* the users Express response object has
	* download headers set against it and the 
	* track is downloaded and piped directly
	* to the response object causing it to be
	* downloaded in the browser
	* @param  {String} rawUrl The soundcloud URL the user wants to download
	* @param  {Object} response The users ExpressJS response object
	* @return {Object}          The users ExpressJS response object
	*/
	download: function(rawUrl, e_response, callback) {
		
		if(!callback || typeof callback !== 'function') {
			if(e_response) {
				return e_response.status(400).json({
					message: "Callback not given",
					status: 400
				});
			} else {
				throw new Error("Callback not given");
			}
		}

		if (!rawUrl) {
			return callback({
				message: this.errorStrings.rawurl,
				status: 400
			}, false);
		}

		if(!e_response) {
			return callback({
				message: this.errorStrings.response,
				status: 400
			}, false);
		}

		if(!this.getClientId()) {
			return callback({
				message: this.errorStrings.clientid,
				status: 401
			}, false);
		}

		var me = this;

		request("http://api.soundcloud.com/resolve.json?url=" + rawUrl + "&client_id=" + this.getClientId(), function(error, response, data) {
			if(error) {
				return callback({
					message: error,
					status: 500
				}, false);
			}

			if(response.statusCode !== 200) {
				return callback({
					message: me.errorStrings.not200,
					status: response.statusCode
				}, false);
			}

			data = JSON.parse(data);

			// Check to see if the result is a 
			// single song or user has provided
			// link to e.g. artist account;
			if(!me.isValidResponse(data)) {
				return callback({
					message: me.errorStrings.notvalid,
					status: 400
				}, false);
			}


			// Check if the song is streamable
			if(!me.isStreamable(data)) {
				return callback({
					message: me.errorStrings.notstreamable,
					status: 405
				}, false);
			}

			var streamURL = me.createStreamUrl(data);

			// Set headers to force download of file.
			e_response.setHeader("Content-Type","application/octet-stream");
			e_response.setHeader("Content-Transfer-Encoding", "Binary");
			e_response.setHeader("Content-disposition", "attachment; filename=\"" + data.title + ".mp3\"");


			// Request the file and pipe it to
			// the response.
			request.get(streamURL).pipe(e_response);
		});
	}
};