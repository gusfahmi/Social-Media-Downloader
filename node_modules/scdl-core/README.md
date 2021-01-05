# scdl-core

A lightweight SoundCloud downloading module for Node.js

![GitHub top language](https://img.shields.io/github/languages/top/ducktrshessami/scdl-core)

# Installation

After installing [Node.js](https://nodejs.org/), run the following command in your package directory:

```
npm install github:ducktrshessami/scdl-core
```

When I become more social I'll consider putting this on [npm](https://www.npmjs.com/).

# Usage

```js
const fs = require("fs");
const scdl = require("scdl-core");

scdl.setClientID("YOUR_CLIENT_ID");

scdl("https://soundcloud.com/ducktrshessami/unfinished")
    .pipe(fs.createWriteStream("song.mp3"));
```

# API

## Table of Contents

1. [scdl](#scdlurl-options)
2. [scdl.setClientID](#scdlsetclientidid)
3. [scdl.setOauthToken](#scdlsetoauthtokentoken)
4. [scdl.getInfo](#scdlgetinfourl)
5. [scdl.downloadFromInfo](#scdldownloadfrominfoinfo-options)
6. [scdl.validateURL](#scdlvalidateurlurl)
7. [scdl.getPermalinkURL](#scdlgetpermalinkurlurl)

## scdl(URL[, options])

Attempts to download a song from a URL.

Returns a [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable).

`options` is an object that can contain the following properties:

- `strict` - `Boolean`

    If set to true, will only stream if all other options match a transcoding's properties
    
    If set to false, will stream the transcoding with the most matched properties

    **Defaults to false**

- `preset` - `String`

    Example values:

    - `mp3_0_1` **(default)**
    - `opus_0_0`
    - `mp3` (short for `mp3_0_1`)
    - `opus` (short for `opus_0_0`)

- `protocol` - `String`

    Example values:

    - `progressive` **(default)**
    - `hls`

- `mimeType` - `String`

    Example values:

    - `audio/mpeg` **(default)**
    - `audio/ogg; codecs=\"opus\"`
    - `mpeg` (short for `audio/mpeg`)
    - `opus` (short for `audio/ogg; codecs=\"opus\"`)

- `quality` - `String`

    **Defaults to `sq`**

    So far I've only ever seen this as `sq`, which I assume stands for "standard quality". I'm unsure whether I've only ever seen `sq` because I'm not a [SoundCloud Go+](http://soundcloud.com/go) subscriber, or if `hq` simply doesn't exist.

Transcoding matching will prioritize options in the following order from most important to least:

`quality > protocol > preset > mimeType`

## scdl.setClientID(ID)

Set your client_id for authentication.

***You must set either your client_id or your OAuth token before using this module's other features***

<details>
<summary>How to get your client_id</summary>

You do ***not*** need a SoundCloud account to obtain a client_id.

1. Go to SoundCloud in your web browser

2. Open the developer tools (pressing F12 usually works)

3. Open the Network tab of the developer tools

4. Refresh the page to populate the Network tab

5. Type `client_id` in the filter box

6. Grab your client_id from the request URL of any items that show up

Example: `https://api-v2.soundcloud.com/me/play-history/tracks?client_id=YOUR_CLIENT_ID`

</details>

## scdl.setOauthToken(token)

Set your OAuth token for authentication.

***You must set either your client_id or your OAuth token before using this module's other features***

<details>
<summary>How to get your OAuth token</summary>

You ***do*** need a SoundCloud account to obtain an OAuth token.

***Unfortunately, it is no longer possible to obtain your OAuth token without [an app](https://developers.soundcloud.com/), and SoundCloud [has not been taking API application requests in a while](https://soundcloud.com/you/apps/new).***

I'm leaving this method here in case it happens to work randomly.

1. Go to SoundCloud in your web browser

2. If you are logged in to your account, log out.

3. Open the developer tools (pressing F12 usually works)

4. Open the Network tab of the developer tools

5. Check the `Preserve log` box (`Persist Logs` in cog wheel on Firefox)

6. Log in to your account

7. Grab the `access_token` from the first few items that show up

8. If your access_token does not show up, try again from Step 2. It can take a couple tries

Example: `access_token: X-XXXXXX-XXXXXXXX-XXXXXXXXXXXXXXX`

</details>

## scdl.getInfo(URL)

Returns a promise that resolves in the track's metadata.

I think it can technically get info for other things like users and playlists, but this is primarily used for grabbing a track's stream URL.

<details>
<summary>Example output</summary>

```json
{
    "artwork_url": "https://i1.sndcdn.com/artworks-000667318813-6hnoe2-large.jpg",
    "caption": null,
    "commentable": true,
    "comment_count": 0,
    "created_at": "2020-01-14T10:43:08Z",
    "description": "https://soundcloud.com/xmittens/untitled\nhttps://youtu.be/1nCqRmx3Dnw\n\nI probably won't finish this",
    "downloadable": false,
    "download_count": 0,
    "duration": 47020,
    "full_duration": 47020,
    "embeddable_by": "all",
    "genre": "memes",
    "has_downloads_left": true,
    "id": 743253892,
    "kind": "track",
    "label_name": null,
    "last_modified": "2020-01-14T10:43:08Z",
    "license": "cc-by-nc-sa",
    "likes_count": 0,
    "permalink": "unfinished",
    "permalink_url": "https://soundcloud.com/ducktrshessami/unfinished",
    "playback_count": 1,
    "public": true,
    "publisher_metadata": {
        "id": 743253892,
        "urn": "soundcloud:tracks:743253892",
        "contains_music": true
    },
    "purchase_title": null,
    "purchase_url": null,
    "release_date": null,
    "reposts_count": 0,
    "secret_token": null,
    "sharing": "public",
    "state": "finished",
    "streamable": true,
    "tag_list": "",
    "title": "unfinished",
    "uri": "https://api.soundcloud.com/tracks/743253892",
    "urn": "soundcloud:tracks:743253892",
    "user_id": 69845790,
    "visuals": null,
    "waveform_url": "https://wave.sndcdn.com/6GVCpQgAUtBo_m.json",
    "display_date": "2020-01-14T10:43:08Z",
    "media": {
        "transcodings": [
            {
                "url": "https://api-v2.soundcloud.com/media/soundcloud:tracks:743253892/d619e67a-e532-4d7c-9ad7-71c9e1899390/stream/hls",
                "preset": "mp3_0_1",
                "duration": 47020,
                "snipped": false,
                "format": {
                    "protocol": "hls",
                    "mime_type": "audio/mpeg"
                },
                "quality": "sq"
            },
            {
                "url": "https://api-v2.soundcloud.com/media/soundcloud:tracks:743253892/d619e67a-e532-4d7c-9ad7-71c9e1899390/stream/progressive",
                "preset": "mp3_0_1",
                "duration": 47020,
                "snipped": false,
                "format": {
                    "protocol": "progressive",
                    "mime_type": "audio/mpeg"
                },
                "quality": "sq"
            },
            {
                "url": "https://api-v2.soundcloud.com/media/soundcloud:tracks:743253892/810bb079-0950-485c-ab36-5eadd381f623/stream/hls",
                "preset": "opus_0_0",
                "duration": 46980,
                "snipped": false,
                "format": {
                    "protocol": "hls",
                    "mime_type": "audio/ogg; codecs=\"opus\""
                },
                "quality": "sq"
            }
        ]
    },
    "monetization_model": "BLACKBOX",
    "policy": "MONETIZE",
    "user": {
        "avatar_url": "https://i1.sndcdn.com/avatars-000341725228-ao2hve-large.jpg",
        "city": null,
        "comments_count": 0,
        "country_code": null,
        "created_at": "2013-12-10T03:28:48Z",
        "creator_subscriptions": [
            {
                "product": {
                    "id": "free"
                }
            }
        ],
        "creator_subscription": {
            "product": {
                "id": "free"
            }
        },
        "description": null,
        "followers_count": 3,
        "followings_count": 47,
        "first_name": "",
        "full_name": "",
        "groups_count": 0,
        "id": 69845790,
        "kind": "user",
        "last_modified": "2019-04-02T08:57:06Z",
        "last_name": "",
        "likes_count": 0,
        "playlist_likes_count": 0,
        "permalink": "ducktrshessami",
        "permalink_url": "https://soundcloud.com/ducktrshessami",
        "playlist_count": 0,
        "reposts_count": null,
        "track_count": 7,
        "uri": "https://api.soundcloud.com/users/69845790",
        "urn": "soundcloud:users:69845790",
        "username": "ducktrshessami",
        "verified": false,
        "visuals": {
            "urn": "soundcloud:users:69845790",
            "enabled": true,
            "visuals": [
                {
                    "urn": "soundcloud:visuals:36754492",
                    "entry_time": 0,
                    "visual_url": "https://i1.sndcdn.com/visuals-000069845790-kKjQiw-original.jpg"
                }
            ],
            "tracking": null
        },
        "badges": {
            "pro_unlimited": false,
            "verified": false
        }
    }
}
```

</details>

## scdl.downloadFromInfo(info[, options])

Attemps to download a song from an info object obtained from scdl.getInfo.

Skips a couple steps that scdl(URL) takes, since this assumes you're actually passing a track's info.

`options` are the same as those in [scdl(URL[, options])](#scdlurl-options) above.

## scdl.validateURL(URL)

Returns a Boolean of whether the URL passed is a valid track URL.

## scdl.getPermalinkURL(URL)

Returns a standardized track URL.

Format: `https://soundcloud.com/ARTIST/SONG_TITLE`
