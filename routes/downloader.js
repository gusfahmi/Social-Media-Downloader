const request = require('request');
const router = require('express').Router();
const youtubeDl = require('youtube-dl');  
const tiktokScraper = require('tiktok-scraper'); 
const scdl = require("scdl-core");

const SOUNDCLOUD_CLIENT_ID = 'q9cqHFmpYvwB8fPF05c3K0wLHLvK9ZMS'; 

function toSupportedFormat(url) {
    if (url.includes("list=")) {
        var playlistId = url.substring(url.indexOf('list=') + 5);
        return "https://www.youtube.com/playlist?list=" + playlistId;
    }
    return url;
}


router.post('/instagram', (req, res)=>{
    let url_post = req.body.url;
    let split_url = url_post.split('/');
    let ig_code = split_url[4];

    const url = "https://www.instagram.com/p/"+ig_code+"/?__a=1";

    request.get(url, (err, response, body)=>{
 
        if(err){
            res.json({status: "error", details: "Error on getting response"});
            res.end();
        }else{
            let json = JSON.parse(body);
    
            if(json.hasOwnProperty("graphql")){

                let postType = json.graphql.shortcode_media.__typename;
            
                //GraphImage = single image post
                if(postType === "GraphImage"){

                    let displayUrl = json.graphql.shortcode_media.display_url;
                    let captionCheck = json.graphql.shortcode_media.edge_media_to_caption.edges;
                    let caption;
                    if(captionCheck.length == 1){
                        caption = json.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text;
                    }else{
                        caption = "";
                    }

                    let owner = json.graphql.shortcode_media.owner.username;
                    let is_verified = json.graphql.shortcode_media.owner.is_verified;
                    let profile_pic = json.graphql.shortcode_media.owner.profile_pic_url;
                    let full_name = json.graphql.shortcode_media.owner.full_name;
                    let is_private = json.graphql.shortcode_media.owner.is_private;
                    let total_media = json.graphql.shortcode_media.owner.edge_owner_to_timeline_media.count;
        
        
                    let hashtags = caption.match(/#\w+/g);

                    let dataDownload = displayUrl;

                    res.json({status: "success", postType: "SingleImage", displayUrl: displayUrl, caption: caption, owner: owner, is_verified: is_verified, profile_pic: profile_pic, full_name: full_name, is_private: is_private, total_media: total_media, hashtags: hashtags, dataDownload: dataDownload});
                    res.end();

                //GraphSidecar = multiple post
                }else if(postType === "GraphSidecar"){
    
                    let displayUrl = json.graphql.shortcode_media.display_url;
                    let captionCheck = json.graphql.shortcode_media.edge_media_to_caption.edges;
                    let caption, download_url;
                    if(captionCheck.length == 1){
                        caption = json.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text;
                    }else{
                        caption = "";
                    }

                    let owner = json.graphql.shortcode_media.owner.username;
                    let is_verified = json.graphql.shortcode_media.owner.is_verified;
                    let profile_pic = json.graphql.shortcode_media.owner.profile_pic_url;
                    let full_name = json.graphql.shortcode_media.owner.full_name;
                    let is_private = json.graphql.shortcode_media.owner.is_private;
                    let total_media = json.graphql.shortcode_media.owner.edge_owner_to_timeline_media.count;


                    let hashtags = caption.match(/#\w+/g); 

                    let dataDownload = [];
                    let total_post = json.graphql.shortcode_media.edge_sidecar_to_children.edges.length;
                    for(let i=0; i<total_post; i++){
                        let is_video = json.graphql.shortcode_media.edge_sidecar_to_children.edges[i].node.is_video;
                        let placeholder_url = json.graphql.shortcode_media.edge_sidecar_to_children.edges[i].node.display_url;
                        if(is_video === false){
                            download_url = json.graphql.shortcode_media.edge_sidecar_to_children.edges[i].node.display_url;
                        }else{
                            download_url = json.graphql.shortcode_media.edge_sidecar_to_children.edges[i].node.video_url;
                        }

                        dataDownload.push({is_video: is_video, placeholder_url: placeholder_url, download_url: download_url});
    
                    }
    
                    res.json({status: "success", postType: "MultiplePost", displayUrl: displayUrl, caption: caption, owner: owner, is_verified: is_verified, profile_pic: profile_pic, full_name: full_name, is_private: is_private, total_media: total_media, hashtags: hashtags, dataDownload: dataDownload});
                    res.end();

                //GraphVideo = video post
                }else if(postType === "GraphVideo"){
    

                    let displayUrl = json.graphql.shortcode_media.display_url;
                    let captionCheck = json.graphql.shortcode_media.edge_media_to_caption.edges;
                    let caption;
                    if(captionCheck.length == 1){
                        caption = json.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text;
                    }else{
                        caption = "";
                    }

                    let owner = json.graphql.shortcode_media.owner.username;
                    let is_verified = json.graphql.shortcode_media.owner.is_verified;
                    let profile_pic = json.graphql.shortcode_media.owner.profile_pic_url;
                    let full_name = json.graphql.shortcode_media.owner.full_name;
                    let is_private = json.graphql.shortcode_media.owner.is_private;
                    let total_media = json.graphql.shortcode_media.owner.edge_owner_to_timeline_media.count;
        
        
                    let hashtags = caption.match(/#\w+/g); 
                    let dataDownload = json.graphql.shortcode_media.video_url;

                    res.json({status: "success", postType: "SingleVideo", displayUrl: displayUrl, caption: caption, owner: owner, is_verified: is_verified, profile_pic: profile_pic, full_name: full_name, is_private: is_private, total_media: total_media, hashtags: hashtags, dataDownload: dataDownload});
                    res.end();


                }else{
                    res.json({status: "error", details: "No Post Type Found"});
                }

            }else{
                res.json({status: "error", details: "URL Failed"});
                res.end();
            }
        }
         
    })

});


router.post('/youtube', (req, res)=>{
    const url = req.body.url;

    youtubeDl.getInfo(url, function(err, info) {
        
        if (err){
            res.json({status: "error", details: err});
            res.end();
        }else{

            if(info.hasOwnProperty('uploader_url')){

                let ownerUrl = info.uploader_url;
                let ownerId = info.uploader_id;
                let channelUrl = info.channel_url;
                let uploader = info.uploader;

                let totalViews = info.view_count;
                let urlId = info.id; 

                let thumbnail = info.thumbnail;
                let description = info.description;
                let filename = info._filename;
                let duration = info.duration;
                let title = info.fulltitle; 
                let categories = info.categories;
 
                let dataFormats = []; 
                totalFormats = info.formats.length;
                for(let i=0; i<totalFormats; i++){

                    let formatId = info.formats[i].format_id;
                    let dataDownload = info.formats[i].url;
                    let format = info.formats[i].format_note;
                    let ext = info.formats[i].ext;
                    let formatText = info.formats[i].format;
                    let filesize = info.formats[i].filesize; 

                    dataFormats.push({formatId: formatId, dataDownload: dataDownload, format: format, ext: ext, formatText: formatText, filesize: filesize});

                }

                res.json({status: "success", ownerUrl: ownerUrl, ownerId: ownerId, channelUrl: channelUrl, uploader: uploader, totalViews: totalViews, urlId: urlId, thumbnail: thumbnail, description: description, filename: filename, duration: duration, title: title, categories: categories, dataFormats: dataFormats});
                res.end();

            }else{
                res.json({status: "error", details: "Failed, Please check the URL!"});
                res.end();
            }
 

        }

    })

});


router.post('/youtube-playlist', (req, res)=>{

    const url = toSupportedFormat(req.body.url);

    youtubeDl.getInfo(url, function(err, info) {
        
        if (err){
            res.json({status: "error", details: err});
            res.end();
        }else{ 
            
            let totalPlaylists = info.length;
            

            let dataDownloads= [];
            for(let i=0; i<totalPlaylists; i++){

                let ownerUrl = info[i].uploader_url;
                let ownerId = info[i].uploader_id;
                let channelUrl = info[i].channel_url;
                let uploader = info[i].uploader;

                let totalViews = info[i].view_count;
                let urlId = info[i].id; 

                let thumbnail = info[i].thumbnail;
                let description = info[i].description;
                let filename = info[i]._filename;
                let duration = info[i].duration;
                let title = info[i].fulltitle; 
                let categories = info[i].categories;
 
                let dataFormats = []; 
                totalFormats = info[i].formats.length;
                for(let j=0; j<totalFormats; j++){

                    let formatId = info[i].formats[j].format_id;
                    let dataDownload = info[i].formats[j].url;
                    let format = info[i].formats[j].format_note;
                    let ext = info[i].formats[j].ext;
                    let formatText = info[i].formats[j].format;
                    let filesize = info[i].formats[j].filesize; 

                    dataFormats.push({formatId: formatId, dataDownload: dataDownload, format: format, ext: ext, formatText: formatText, filesize: filesize});

                }

                dataDownloads.push({ownerUrl: ownerUrl, ownerId: ownerId, channelUrl: channelUrl, uploader: uploader, totalViews: totalViews, urlId: urlId, thumbnail: thumbnail, description: description, filename: filename, duration: duration, title: title, categories: categories, dataFormats: dataFormats});
                
            }


            res.json({status: "success", dataDownloads: dataDownloads});
            res.end();
            
        }

    })

});


router.post('/tiktok', async (req, res)=>{
    const url = req.body.url;

    try{
        const data = await tiktokScraper.getVideoMeta(url); 

        if(data.hasOwnProperty('headers')){

            let headers = data.headers;
            let username = data.collector[0].authorMeta.name;
            let name = data.collector[0].authorMeta.nickName;
            let profilePic = data.collector[0].authorMeta.avatar;

            let description = data.collector[0].text;

            let thumbnail = data.collector[0].imageUrl;
            let urlDownload = data.collector[0].videoUrl;

            let format = data.collector[0].videoMeta.ratio;

            res.json({status: "success", headers: headers, username: username, name: name, profilePic: profilePic, description: description, thumbnail: thumbnail, format: format, urlDownload: urlDownload});
            res.end();

        }else{
            res.json({status: "error", details: "Failed, Please check the URL!"});
            res.end();
        }
        
    }catch(err){
        res.json({status: "error", details: err});
    }
    

});


router.post('/facebook', async (req, res)=>{

    const url = req.body.url; 

    youtubeDl.getInfo(url, (err, info)=>{
        if(err){
            res.json({status: "error", details: err});
            res.end();
        }else{

            let filename = info._filename;
            let thumbnail = info.thumbnails[0].url;
            let title = info.fulltitle;   

            let dataDownloads = [];
            let totalFormats = info.formats.length;
            for(let i=0; i<totalFormats; i++){
                
                let formatNote = info.formats[i].format_note;
                let extension = info.formats[i].ext;
                let urlDownload = info.formats[i].url; 

                dataDownloads.push({formatNote: formatNote, extension: extension, urlDownload: urlDownload});
            }


            res.json({status: "success", title: title, thumbnail: thumbnail, filename: filename, dataDownloads: dataDownloads});
            res.end();
 

        }
         
    });
 
    
});


// router.post('/soundcloud', async (req, res)=>{

//     let url = req.body.url;
    
//     scdl.setClientID(SOUNDCLOUD_CLIENT_ID);
//     const dataSl = await scdl.getInfo(url); 
    
//     if(dataSl.hasOwnProperty('genre')){

//         let thumbnail = dataSl.artwork_url;
//         let description = dataSl.description;
//         let duration = dataSl.full_duration;
//         let genre = dataSl.genre;
//         let title = dataSl.title;
//         let username = dataSl.user.username;
//         let profilePic = dataSl.user.avatar_url;
//         let mimeType = dataSl.media.transcodings[1].format.mime_type; 
//         let quality = dataSl.media.transcodings[1].quality;

//         let mediaUrl = dataSl.media.transcodings[1].url; 
//         let urlGetDownload = mediaUrl+"?client_id="+SOUNDCLOUD_CLIENT_ID; 

//         request.get(urlGetDownload, (err, response, body)=>{
//             if(err){
//                 res.json({status: "error", details: err});
//                 res.end();
//             }else{

//                 let urlDownload = JSON.parse(body).url; 
//                 res.json({status: "success", title: title, thumbnail: thumbnail, duration: duration, genre: genre, mimeType: mimeType, quality: quality, description: description, urlDownload: urlDownload, username: username, profilePic: profilePic});
//                 res.end();

//             }
//         });

//     }else{
//         res.json({status: "error", details: "Failed, Please check the URL."});
//         res.end();
//     }

    
 
 
 

// })


router.post('/dailymotion', (req, res)=>{
    
    let url= req.body.url;

    youtubeDl.getInfo(url, (err, info)=>{
        if(err){
            res.json({status: "error", details: err});
            res.end();
        }else{

            if(info.hasOwnProperty('_filename')){

                let filename = info._filename;
                let extension = info.ext;
                let format = info.height;
                let description= info.description;
                let uploader= info.uploader;
                let title = info.fulltitle;
                let urlDownload = info.url;
                let thumbnail = info.thumbnail;

                res.json({status: "success", filename: filename, extension: extension, format: format, description: description, uploader: uploader, title: title, thumbnail: thumbnail, urlDownload: urlDownload})
                res.end();

            }else{
                res.json({status: "error", details: "Failed, Please check the URL!"});
                res.end();
            }

        }
    });

})

 
module.exports = router;
