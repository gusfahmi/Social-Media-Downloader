const stream = require("stream"); // Streams
const fetch = require("node-fetch"); // GET requests

var client_id, oauth_token; // SoundCloud API access

const defaultOptions = { // Default stream properties
    strict: false,
    preset: "mp3_0_1",
    protocol: "progressive",
    mimeType: "audio/mpeg",
    quality: "sq"
};

/*
Stream a song from its URL

@param URL: string
@return stream.Readable
*/
module.exports = function scdl(URL, options = defaultOptions) {
    const read = new stream.PassThrough();
    getStreamableStreamURL(URL, options)
        .then(fetchAPI)
        .then(response => response.json())
        .then(json => fetch(json.url))
        .then(sound => sound.body.pipe(read))
        .catch(error => read.emit("error", error));
    return read;
}

/*
Set the client_id to access the API without an oauth_token

@param ID: string
*/
module.exports.setClientID = function setClientID(ID) {
    client_id = ID;
}

/*
Set the oauth_token to access the API without a client_id

@param token: string
*/
module.exports.setOauthToken = function setOauthToken(token) {
    oauth_token = token;
}

/*
GET metadata from a URL

@param URL: string
@return Promise<object>
*/
module.exports.getInfo = function getInfo(URL) {
    return new Promise((resolve, reject) => {
        fetchAPI("https://api-v2.soundcloud.com/resolve?url=" + handleExcess(URL))
            .then((response) => response.json())
            .then(resolve)
            .catch(reject);
    });
}

/*
Stream a song from its metadata

@param info: object
@return stream.Readable
*/
module.exports.downloadFromInfo = function downloadFromInfo(info, options = defaultOptions) {
    const read = new stream.PassThrough();
    if (info.streamable) {
        var progressive = findTranscoding(info.media.transcodings, options);
        if (progressive) {
            fetchAPI(progressive.url)
                .then(response => response.json())
                .then(json => fetch(json.url))
                .then(sound => sound.body.pipe(read))
                .catch(error => read.emit("error", error));
        }
    }
    return read;
}

/*
Checks if a URL format matches a SoundCloud song

@param URL: string
@return Boolean
*/
module.exports.validateURL = function validateURL(URL) {
    URL = handleExcess(URL);
    var foo = URL.split('/');
    return (foo.length == 5 && URL.startsWith("https://soundcloud.com/")) || (foo.length == 3 && URL.startsWith("soundcloud.com/"));
}

/*
Formats a URL as the song's permalink URL

@param URL: string
@return string
*/
module.exports.getPermalinkURL = function getPermalinkURL(URL) {
    if (module.exports.validateURL(URL)) {
        URL = handleExcess(URL);
        var foo = URL.split('/');
        return "https://soundcloud.com/" + foo[foo.length - 2] + "/" + foo[foo.length - 1];
    }
}

/*
Remove fluff from URLs

@param URL: string
@return string
*/
function handleExcess(URL) {
    const cutoff = ['?', '#'];
    var foo = cutoff.reduce((str, chr) => str.includes(chr) ? str.substring(0, str.indexOf(chr)) : str, URL).trim().toLowerCase();
    return foo[foo.length - 1] == '/' ? foo.substring(0, foo.length - 1) : foo;
}

/*
Attempt to fetch with either client_id or oauth_token

@param URL: string
@return Promise<object>
*/
function fetchAPI(URL) {
    return new Promise((resolve, reject) => {
        var foo = URL.includes('?') ? '&' : '?';
        if (URL.includes('#')) {
            URL = URL.substring(0, URL.indexOf('#'));
        }
        if (client_id) {
            fetch(URL + foo + "client_id=" + client_id).then(resolve).catch(reject);
        }
        else if (oauth_token) {
            fetch(URL + foo + "oauth_token=" +  oauth_token).then(resolve).catch(reject);
        }
        else {
            reject("Authentication not set");
        }
    });
}

/*
Get a streamable song's streaming URL

@param URL: string
@return Promise<string>
*/
function getStreamableStreamURL(URL, options) {
    return new Promise((resolve, reject) => {
        module.exports.getInfo(URL).then((json) => {
            if (json.streamable) {
                var streamable = findTranscoding(json.media.transcodings, options); // Specifically grab the mp3 with the progressive protocol
                if (streamable) {
                    resolve(streamable.url);
                }
                else {
                    reject("Streamable stream URL not found for `" + URL + "`"); // Stream URL could not be found
                }
            }
            else {
                reject("`" + URL + "` not streamable"); // Song isn't streamable
            }
        }).catch(reject);
    });
}

/*
Find a transcoding matching the provided options

@param transcodings: Array
@param options: object
@return object/undefined
*/
function findTranscoding(transcodings, options) {
    if (options.strict) { // Match all present options
        return transcodings.find(tc => (
            options.preset ? tc.preset.toLowerCase().trim().includes(options.preset.toLowerCase().trim()) : true
            && options.protocol ? tc.format.protocol.toLowerCase().trim().includes(options.protocol.toLowerCase().trim()) : true
            && options.mimeType ? tc.format.mime_type.toLowerCase().trim().includes(options.mimeType.toLowerCase().trim()) : true
            && options.quality ? tc.quality.toLowerCase().trim().includes(options.quality.toLowerCase().trim()) : true
        ));
    }
    else { // Find closest match
        let index = 0, best = 0;
        for (let i = 0; i < transcodings.length; i++) {
            let score = 0; // Match scoring
            if (options.preset && transcodings[i].preset.toLowerCase().trim().includes(options.preset.toLowerCase().trim())) {
                score += 1.1;
            }
            if (options.protocol && transcodings[i].format.protocol.toLowerCase().trim().includes(options.protocol.toLowerCase().trim())) {
                score += 1.2;
            }
            if (options.mimeType && transcodings[i].format.mime_type.toLowerCase().trim().includes(options.mimeType.toLowerCase().trim())) {
                score += 1;
            }
            if (options.quality && transcodings[i].quality.toLowerCase().trim().includes(options.quality.toLowerCase().trim())) {
                score += 1.3;
            }
            if (score > best) { // Best check
                index = i;
                best = score;
            }
        }
        if (best) { // Match found
            return transcodings[index];
        }
        else { // Not even close. Try default options once
            options = defaultOptions;
            options.strict = true;
            return findTranscoding(transcodings, options);
        }
    }
}
