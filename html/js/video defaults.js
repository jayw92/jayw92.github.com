
// GLOBAL VARIABLES
var videoID, link, data, snippet, snip, statistics, status, fileDetails, processingDetails, suggestions;
var v_CategoryTitle, v_FailureReason, v_PartsProcessed, v_PartsProcessedPercent, v_PartsTotal, v_processingFailureReason;
var v_RejectionReason, v_Thumb_URL, v_timeLeftMs;
var videoHTML, newHTML, str, str2, str3;
var updateRequest;
var c_CategoryId, c_Description, c_License, c_PrivacyStatus, c_TagsList, c_Title, c_Embeddable, c_PublicStatsViewable;
var nextPageToken, prevPageToken, playlistItems, uploadsPlaylistId, uploadsDropdownHTML;
var playlists, playlistsDropdownHTML;
var videoSelectedPlaylistId, videoSelectedPlaylist;
var cateSnip, CategoryTitleReturn, categoryDropdownHTML;
var thumbnail_url, thumbnailimage;


////////////////////////////////////////////////////////////////////////////
//                         FIRST PAGE LOAD FUNCTIONS
////////////////////////////////////////////////////////////////////////////

// Once the api loads call enable the search box.
function handleAPILoaded() {
    enableForm();
    $('#uploadsSelectionBox').attr('disabled', true);
    $('#update-status').html("");
    categoryDropdownHTML = playlistsDropdownHTML = uploadsDropdownHTML = videoHTML = "";
    videoSelectedPlaylistId = thumbnail_url = "0";
    getCategoryList();
}

// Default form looks for page objects
function enableForm() {
    $('#uploadItems-status').html("");
    $('#update-button').attr('disabled', true);
}

// Get Category Titles from Youtube
function getCategoryList() {
    var categoryTitleRequest = gapi.client.youtube.videoCategories.list({
        regionCode: 'US',
        part: 'snippet'
    });
    categoryTitleRequest.execute(function(res) {
        str3 = JSON.stringify(res.result);
        cateSnip = JSON.parse(str3);
        var index = 0;
        while (typeof cateSnip['items'][index] !== "undefined") {
            CategoryTitleReturn = cateSnip['items'][index]['snippet']['title'];
            var CategoryNumber = cateSnip['items'][index]['id'];
            categoryDropdownHTML = categoryDropdownHTML + "<option value=\"" + CategoryNumber + "\">" + CategoryTitleReturn + "</option>\n";
            index++;
        }
        $('#c_CategoryId').html(categoryDropdownHTML);
        requestUserChannelData();
    });
}

// Get user channel details
function requestUserChannelData() {
    // https://developers.google.com/youtube/v3/docs/channels/list
    var request = gapi.client.youtube.channels.list({
        mine: true,
        part: 'contentDetails'
    });
    request.execute(function(response) {
        uploadsPlaylistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
        getUserPlaylists(true);
    });
}

////////////////////////////////////////////////////////////////////////////
//                         -END OF LOAD SECTION -
////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
//                             PLAYLISTS SELECTION
//                         PLAYLISTS RELATED FUNCTIONS
////////////////////////////////////////////////////////////////////////////

// Get All playlists
function getUserPlaylists(isFirstLoad, pageToken) {
    $('#deletelist-button').attr('disabled', true);
    var requestOptions = {
        mine: true,
        part: 'id,snippet',
        maxResults: 10
    };
    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }
    var request = gapi.client.youtube.playlists.list(requestOptions);
    request.execute(function(response) {
        // Only show the page buttons if there's a next or previous page.
        nextPlaylistToken = response.result.nextPageToken;
        if (nextPlaylistToken) {
            $('#nextlist-button').attr('disabled', false);
        }
        else {
            $('#nextlist-button').attr('disabled', true);
        }

        prevPlaylistToken = response.result.prevPageToken;
        if (prevPlaylistToken) {
            $('#prevlist-button').attr('disabled', false);
        }
        else {
            $('#prevlist-button').attr('disabled', true);
        }

        playlists = response.result.items;
        if (playlists) {
            playlistsDropdownHTML = "";
            var index = 0;
            while (typeof playlists[index] !== "undefined") {
                var pTitle = playlists[index].snippet.title;
                var playlistid = playlists[index].id;
                playlistsDropdownHTML = playlistsDropdownHTML + "<option value=\"" + playlistid + "\">" + pTitle + "</option>\n";
                index++;
            }
            playlistsDropdownHTML = playlistsDropdownHTML + "<option selected=\"selected\" value=\"" + 0 + "\">Select a Playlist</option>\n"
            $('#c_PlaylistId').html(playlistsDropdownHTML);

            if (isFirstLoad)
                requestVideoPlaylist();

        } else {
            $('#uploadItems-status').html("<div class=\"alert alert-danger\"><strong>Sorry!</strong> Could not find any playlists under this account.</div>");
        }
    });
}

// Get playlist for uploads
function requestVideoPlaylist(pageToken) {
    var requestOptions = {
        playlistId: uploadsPlaylistId,
        part: 'snippet',
        maxResults: 20
    };
    if (pageToken) {
        requestOptions.pageToken = pageToken;
    }
    var request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(function(response) {
        // Only show the page buttons if there's a next or previous page.
        nextPageToken = response.result.nextPageToken;
        if (nextPageToken) {
            $('#next-button').attr('disabled', false);
        }
        else {
            $('#next-button').attr('disabled', true);
        }

        prevPageToken = response.result.prevPageToken;
        if (prevPageToken) {
            $('#prev-button').attr('disabled', false);
        }
        else {
            $('#prev-button').attr('disabled', true);
        }

        playlistItems = response.result.items;
        if (playlistItems) {
            $('#uploadItems-status').html("<div class=\"alert alert-success\"><strong>Success!</strong> Found your uploaded videos.</div>");
            uploadsDropdownHTML = "";
            var index = 0;
            while (typeof playlistItems[index] !== "undefined") {
                var uPlaylistTitle = playlistItems[index].snippet.title;
                var videoid = playlistItems[index].snippet.resourceId.videoId;
                uploadsDropdownHTML = uploadsDropdownHTML + "<option value=\"" + videoid + "\">" + uPlaylistTitle + "</option>\n";
                index++;
            }
            $('#uploadsSelectionBox').html(uploadsDropdownHTML);
            $('#uploadsSelectionBox').attr('disabled', false);
        } else {
            $('#uploadItems-status').html("<div class=\"alert alert-danger\"><strong>Sorry!</strong> You have not uploaded any videos.</div>");
        }
    });
}

// Add a video to selected playlistID in video defaults
function addToPlaylist(vid, startPos, endPos) {
    var details = {
        videoId: vid,
        kind: 'youtube#video'
    }
    if (startPos != undefined) {
        details['startAt'] = startPos;
    }
    if (endPos != undefined) {
        details['endAt'] = endPos;
    }
    var request = gapi.client.youtube.playlistItems.insert({
        part: 'snippet',
        resource: {
            snippet: {
                playlistId: videoSelectedPlaylistId,
                resourceId: details
            }
        }
    });
    request.execute(function(response) {
        var result = response.result;
        if (result) {
            $('#uploadItems-status').html("<div class=\"alert alert-success\"><strong>Success!</strong> Added [" + snippet['title'] + "] to playlist [" + videoSelectedPlaylist + "].</div>");
        }
        else {
            $('#uploadItems-status').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> Could not add video to playlist.</div>");
        }
    });
}

////////////////////////////////////////////////////////////////////////////
//                         -END OF PLAYLISTS SECTION -
////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
//                                VIDEO SECTION
//                           VIDEO RELATED FUNCTIONS
////////////////////////////////////////////////////////////////////////////

// Upload thumbnail to video
function setThumbnail() {
    var request = gapi.client.youtube.playlistItems.insert({
        videoID: videoID
    });
    request.execute(function(response) {
        var result = response.result;
            console.log(result);
        if (result) {
           $('#uploaded-image').html("<div class=\"alert alert-success\"><strong>Success!</strong> Thumbnail added to video.</div><img id=\"preview-img\" src=\"" + thumbnailimage + "\" height=\"90\" width=\"120\">");
        }
        else {
            $('#uploaded-image').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> Upload to youtube failed.</div>");
        }
    });
}


// Load selected video data to the video default form
function loadDefaultForm() {
    $('#c_PlaylistId').html(playlistsDropdownHTML);
    $('#c_Title').val(snippet['title']);
    if (status['embeddable'])
        $('#c_Embeddable').prop("checked", true);
    if (status['publicStatsViewable'])
        $('#c_PublicStatsViewable').prop("checked", true);
    $('#c_CategoryId').val(snippet['categoryId']);
    $('#c_PrivacyStatus').val(status['privacyStatus']);
    $('#c_License').val(status['license']);
    $('#c_Description').val(snippet['description']);
    if (typeof snippet['tags'] !== "undefined")
        $('#c_TagsList').val(snippet['tags'].toString());
}

// Apply video default settings to selected video
function updateVideo() {
    c_Title = $('#c_Title').val();
    c_Description = $('#c_Description').val();
    c_TagsList = $('#c_TagsList').val().split(",");

    var ex = document.getElementById("c_CategoryId");
    c_CategoryId = ex.options[ex.selectedIndex].value;
    ex = document.getElementById("c_License");
    c_License = ex.options[ex.selectedIndex].value;
    ex = document.getElementById("c_PrivacyStatus");
    c_PrivacyStatus = ex.options[ex.selectedIndex].value;
    ex = document.getElementById("c_Embeddable");
    c_Embeddable = ex.checked;
    ex = document.getElementById("c_PublicStatsViewable");
    c_PublicStatsViewable = ex.checked;

    snippet['title'] = c_Title;
    snippet['description'] = c_Description;
    snippet['tags'] = c_TagsList;
    snippet['categoryId'] = c_CategoryId;
    status['license'] = c_License;
    status['privacyStatus'] = c_PrivacyStatus;
    status['embeddable'] = c_Embeddable;
    status['publicStatsViewable'] = c_PublicStatsViewable;

    var requestOptions = {
        part: 'snippet,status',
        resource: {id: videoID, snippet: snippet, status: status}
    };

    updateRequest = gapi.client.youtube.videos.update(requestOptions);

    updateRequest.execute(function(response) {
        var res = response.result;
        if (res) {
            if (videoSelectedPlaylistId !== "0") {
                addToPlaylist(videoID);
            }
            if (thumbnail_url !== "0") {
                setThumbnail();
            }
            getVideoData(videoID, true);
            $('#update-status').html("<div class=\"alert alert-success\"><strong>Success!</strong> Updated video details.</div>");
        } else {
            $('#update-status').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> Could not update video details.</div>");
        }
    });
}

// Get video resource from user selection and set necessary values
function getVideoData(vID, withHTML) {
    enableForm();
    videoID = vID;
    link = "//www.youtube.com/embed/" + videoID;
    var request = gapi.client.youtube.videos.list({
        id: videoID,
        part: 'snippet,statistics,status,fileDetails,processingDetails,suggestions'
    });
    request.execute(function(response) {
        data = response;
        snippet = data['items'][0]['snippet'];
        statistics = data['items'][0]['statistics'];
        status = data['items'][0]['status'];
        fileDetails = data['items'][0]['fileDetails'];
        processingDetails = data['items'][0]['processingDetails'];
        suggestions = data['items'][0]['suggestions'];
        v_Thumb_URL = snippet['thumbnails']['default']['url'];
        var categoryRequest = gapi.client.youtube.videoCategories.list({
            id: snippet['categoryId'],
            part: 'snippet'
        });
        categoryRequest.execute(function(res) {
            snip = res.result;
            v_CategoryTitle = snip['items'][0]['snippet']['title'];
            if (withHTML)
                addSearchHTML();
        });
    });
}

// Generate html after a video was targeted by user
function addSearchHTML() {
    loadDefaultForm();
    newHTML = "<h3>Selected <span class=\"text-muted\"> Video</span></h3><hr>";
    videoHTML = "<iframe width=\"400\" height=\"300\" src=\"" + link + "\" frameborder=\"1\" allowfullscreen></iframe>";
    thumbnailHTML = "<p><img data-src=\"holder.js/120x90\" src=\"" + v_Thumb_URL + "\"></p>";

    newHTML = newHTML + "<div class=\"panel panel-primary\">";
    newHTML = newHTML + "<div class=\"panel-heading\"><h4>" + snippet['title'] + "</h4></div>";
    newHTML = newHTML + "<div class=\"panel-body\">";
    newHTML = newHTML + thumbnailHTML;
    newHTML = newHTML + "<p>Video ID: " + videoID + "</p>";
    newHTML = newHTML + "<p>eTag: " + data['items'][0]['etag'] + "</p>";
    newHTML = newHTML + "<p>Published At: " + snippet['publishedAt'] + "</p>";
    newHTML = newHTML + "<p>Video Category: " + v_CategoryTitle + "</p>";
    newHTML = newHTML + "<p>Description: " + snippet['description'] + "</p>";
    if (typeof snippet['tags'] !== "undefined") {
        newHTML = newHTML + "<p>Tags (Separte using commas[,]): <div class=\"well\">" + snippet['tags'].toString() + "</div>";
    }
    else
        newHTML = newHTML + "<p>Tags (Separte using commas[,]): <div class=\"well\"></div>";
    newHTML = newHTML + "<h4>[STATISICS]</h4>";
    newHTML = newHTML + "<p>View Count: " + statistics['viewCount'] + "</p>";
    newHTML = newHTML + "<p>Like Count: " + statistics['likeCount'] + "</p>";
    newHTML = newHTML + "<p>Dislike Count: " + statistics['dislikeCount'] + "</p>";
    newHTML = newHTML + "<p>Favorite Count: " + statistics['favoriteCount'] + "</p>";
    newHTML = newHTML + "<p>Comment Count: " + statistics['commentCount'] + "</p>";
    newHTML = newHTML + "<h4>[STATUS]</h4>";
    newHTML = newHTML + "<p>Embeddable: " + status['embeddable'] + "</p>";
    newHTML = newHTML + "<p>Public Stats Viewable: " + status['publicStatsViewable'] + "</p>";
    newHTML = newHTML + "<p>Privacy Status: " + status['privacyStatus'] + "</p>";
    newHTML = newHTML + "<p>Upload Status: " + status['uploadStatus'] + "</p>";
    if (status['uploadStatus'] === 'failed') {
        v_FailureReason = status['failureReason'];
        newHTML = newHTML + "<p>FAILURE REASON: " + v_FailureReason + "</p>";
    }
    if (status['uploadStatus'] === 'rejected') {
        v_RejectionReason = status['rejectionReason'];
        newHTML = newHTML + "<p>REJECTION REASON: " + v_RejectionReason + "</p>";
    }
    newHTML = newHTML + "<p>License Status: " + status['license'] + "</p>";
    if (typeof fileDetails !== "undefined") {
        newHTML = newHTML + "<h4>[FILE DETAILS]</h4>";
        newHTML = newHTML + "<p>File Name: " + fileDetails['fileName'] + "</p>";
        newHTML = newHTML + "<p>File Size: " + fileDetails['fileSize'] + "</p>";
        newHTML = newHTML + "<p>File Type: " + fileDetails['fileType'] + "</p>";
        newHTML = newHTML + "<p>Duration: " + fileDetails['durationMs'] / 1000 + " seconds</p>";
        newHTML = newHTML + "<p>Bitrate: " + fileDetails['bitrateBps'] + " bps (bits per second)</p>";
        newHTML = newHTML + "<p>Date Created: " + fileDetails['creationTime'] + "</p>";
    }
    newHTML = newHTML + "<h4>[VIDEO PROCESSING]</h4>";
    newHTML = newHTML + "<p>Processing Status: " + processingDetails['processingStatus'] + "</p>";
    if (processingDetails['processingStatus'] === 'failed') {
        v_processingFailureReason = processingDetails['processingFailureReason'];
        newHTML = newHTML + "<p>PROCESSING FAILURE REASON: " + v_processingFailureReason + "</p>";
    }
    if (processingDetails['processingStatus'] === 'processing') {
        v_PartsTotal = processingDetails['processingProgress']['partsTotal'];
        newHTML = newHTML + "<p>Parts to be processed: " + v_PartsTotal + "</p>";
        v_PartsProcessed = processingDetails['processingProgress']['partsProcessed'];
        newHTML = newHTML + "<p>Parts already processed: " + v_PartsProcessed + "</p>";
        v_PartsProcessedPercent = 100 * v_PartsProcessed / v_PartsTotal;
        newHTML = newHTML + "<p>Percent of video processed: " + v_PartsProcessedPercent + " %</p>";
        v_timeLeftMs = processingDetails['processingProgress']['timeLeftMs'];
        newHTML = newHTML + "<p>Parts already processed: " + v_timeLeftMs / 1000 + " seconds</p>";
    }

    newHTML = newHTML + "<h4>[VIDEO SUGGESTIONS]</h4>";
    if (typeof suggestions !== "undefined") {
        if (typeof suggestions['processingErrors'] !== "undefined")
            newHTML = newHTML + "<p>Processing Erros (Causes a failed upload): " + suggestions['processingErrors'].toString() + "</p>";
        if (typeof suggestions['processingWarnings'] !== "undefined")
            newHTML = newHTML + "<p>Processing Warnings (Causes difficulties in processing): " + suggestions['processingWarnings'].toString() + "</p>";
        if (typeof suggestions['processingHints'] !== "undefined")
            newHTML = newHTML + "<p>Processing Hints (Hints for improving processing of video): " + suggestions['processingHints'].toString() + "</p>";
        if (typeof suggestions['tagSuggestions'] !== "undefined")
            newHTML = newHTML + "<p>Tag Suggestions: " + suggestions['tagSuggestions'].toString() + "</p>";
    }
    newHTML = newHTML + "</div></div>";
    populateWithHTML();
}

// Add HTML to page
function populateWithHTML() {
    document.getElementById("search-container").innerHTML = newHTML;
    document.getElementById("VideoPic").innerHTML = videoHTML;
}

////////////////////////////////////////////////////////////////////////////
//                         -END OF VIDEO SECTION -
////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
//                              USER SELECTION
//                       CHANGES TO ANY DOM COMPONENTS
////////////////////////////////////////////////////////////////////////////

// Retrieve the next page of videos.
function nextVids() {
    requestVideoPlaylist(uploadsPlaylistId, nextPageToken);
}

// Retrieve the previous page of videos.
function previousVids() {
    requestVideoPlaylist(uploadsPlaylistId, prevPageToken);
}

// User selected a video
function selectedVideo(sel) {
    $('#uploadItems-status').html("");
    $('#update-status').html("");
    videoID = sel.options[sel.selectedIndex].value;
    getVideoData(videoID, true);
    $('#update-button').attr('disabled', false);
}

// User selected a playlist in the video defaults section
function VideoAddPlaylist(sel) {
    videoSelectedPlaylistId = sel.options[sel.selectedIndex].value;
    videoSelectedPlaylist = sel.options[sel.selectedIndex].text;
}

// User selected to delete thumbnail
function deleteImage() {
    thumbnail_url = "0";
    $('#uploaded-image').html("");
}
// User selected to add a thumbnail
function addthumbnail() {
    var thumbnail = document.getElementById("thumbnailFile");
    var fileSize = thumbnail.files[0].size;

    // Image size less than 2MB, preview image
    if (fileSize < 2097152) {
        if (thumbnail.files && thumbnail.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                thumbnailimage = e.target.result;
                thumbnail_url = thumbnail.value;
                $('#uploaded-image').html("<div class=\"alert alert-success\"><strong>Success!</strong> Thumbnail selected.</div><img id=\"preview-img\" src=\"" + thumbnailimage + "\" height=\"90\" width=\"120\">");
            }

            reader.readAsDataURL(thumbnail.files[0]);
        }
    }
    else {
        $('#uploaded-image').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> Size needs to be less than 2MB.</div>");
    }

}

////////////////////////////////////////////////////////////////////////////
//                         -END OF USER SELECTION -
////////////////////////////////////////////////////////////////////////////
