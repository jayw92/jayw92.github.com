
// GLOBAL VARIABLES
var videoID, link, data, snippet, snip, statistics, status, fileDetails, processingDetails, suggestions;
var v_BitrateBps, v_CategoryId, v_CategoryTitle, v_CommentCount, v_CreationTime, v_Description;
var v_DislikeCount, v_DurationMs, v_FailureReason, v_FavoriteCount, v_FileName, v_FileSize, v_FileType;
var v_License, v_LikeCount, v_PartsProcessed, v_PartsProcessedPercent, v_PartsTotal, v_PrivacyStatus;
var v_ProcessingErrors, v_ProcessingHints, v_ProcessingStatus, v_ProcessingWarnings, v_processingFailureReason;
var v_RejectionReason, v_TagSuggestions, v_TagsList, v_Thumb_URL, v_Title, v_timeLeftMs;
var v_UploadStatus, v_ViewCount;

var videoHTML, newHTML, str, str2, str3;
var u_str, updateRequest;

var c_CategoryId, c_Description, c_License, c_PrivacyStatus, c_TagsList, c_Title, c_Embeddable, c_PublicStatsViewable;

var nextPageToken, prevPageToken, playlistItems, uploadsPlaylistId, uploadsDropdownHTML, channelId;

var prevPlaylistToken, nextPlaylistToken, playlists, playlistsDropdownHTML, SelectedPlaylistId, SelectedPlaylist;
var p_Title, p_Description, p_PrivacyStatus, videoSelectedPlaylistId, videoSelectedPlaylist;

var cateSnip, CategoryTitleReturn, categoryDropdownHTML;


////////////////////////////////////////////////////////////////////////////
//                         FIRST PAGE LOAD FUNCTIONS
////////////////////////////////////////////////////////////////////////////

// Once the api loads call enable the search box.
function handleAPILoaded() {
    enableForm();
    $('#uploadsSelectionBox').attr('disabled', true);
    $('#playlistsSelectionBox').attr('disabled', true);
    categoryDropdownHTML = playlistsDropdownHTML = uploadsDropdownHTML = videoHTML = "";
    videoSelectedPlaylistId = "0";
    getCategoryList();
}

// Default form looks for page objects
function enableForm() {
    $('#uploadItems-status').html("");
    $('#uploadItems-status').html("");
    $('#update-button').attr('disabled', true);
    $('#playlist-button').attr('disabled', false);
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
        console.log("IN HERE");
        var index = 0;
        while (typeof cateSnip['items'][index] !== "undefined") {
            CategoryTitleReturn = cateSnip['items'][index]['snippet']['title'];
            var CategoryNumber = cateSnip['items'][index]['id'];
            console.log(CategoryNumber, CategoryTitleReturn);
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
            $('#Playlists-status').html("<div class=\"alert alert-success\"><strong>Success!</strong> Found playlists under this account.</div>");
            playlistsDropdownHTML = "";
            var index = 0;
            while (typeof playlists[index] !== "undefined") {
                var pTitle = playlistItems[index].snippet.title;
                var playlistid = playlistItems[index].id;
                console.log(playlistid, pTitle);
                playlistsDropdownHTML = playlistsDropdownHTML + "<option value=\"" + playlistid + "\">" + pTitle + "</option>\n";
                index++;
            }
            $('#playlistsSelectionBox').html(playlistsDropdownHTML);
            $('#playlistsSelectionBox').attr('disabled', false);
            playlistsDropdownHTML = playlistsDropdownHTML + "<option selected=\"selected\" value=\"" + 0 + "\">Select a Playlist</option>\n"
            $('#c_PlaylistId').html(playlistsDropdownHTML);

            if (isFirstLoad)
                requestVideoPlaylist();

        } else {
            $('#Playlists-status').html("<div class=\"alert alert-danger\"><strong>Sorry!</strong> Could not find any playlists under this account.</div>");
        }
    });
}

// Get playlist using playlist ID
function requestVideoPlaylist(pageToken) {
    var requestOptions = {
        playlistId: uploadsPlaylistId,
        part: 'snippet',
        maxResults: 10
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
            newHTML = "";
            uploadsDropdownHTML = "";
            var index = 0;
            while (typeof playlistItems[index] !== "undefined") {
                var uPlaylistTitle = playlistItems[index].snippet.title;
                var videoid = playlistItems[index].snippet.resourceId.videoId;
                console.log(videoid, uPlaylistTitle);
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

// Create a playlist
function createPlaylist() {
    var request = gapi.client.youtube.playlists.insert({
        part: 'snippet,status',
        resource: {
            snippet: {
                title: 'Test Playlist',
                description: 'A private playlist created with the YouTube API'
            },
            status: {
                privacyStatus: 'private'
            }
        }
    });
    request.execute(function(response) {
        var result = response.result;
        if (result) {
            uploadsPlaylistId = result.id;
            $('#playlist-id').val(uploadsPlaylistId);
            $('#playlist-title').html(result.snippet.title);
            $('#playlist-description').html(result.snippet.description);
        } else {
            $('#status').html('Could not create playlist');
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
            $('#uploadItems-status').html("<div class=\"alert alert-success\"><strong>Success!</strong> Added [" + v_Title + "] to playlist [" + videoSelectedPlaylist + "].</div>");
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
        v_Title = snippet['title'];
        v_Description = snippet['description'];
        v_Thumb_URL = snippet['thumbnails']['default']['url'];
        v_CategoryId = snippet['categoryId'];
        v_TagsList = snippet['tags'];
        v_ViewCount = statistics['viewCount'];
        v_CommentCount = statistics['commentCount'];
        v_FavoriteCount = statistics['favoriteCount'];
        v_LikeCount = statistics['likeCount'];
        v_DislikeCount = statistics['dislikeCount'];
        v_PrivacyStatus = status['privacyStatus'];
        v_UploadStatus = status['uploadStatus'];
        v_License = status['license'];
        if (typeof fileDetails !== "undefined") {
            v_FileName = fileDetails['fileName'];
            v_FileSize = fileDetails['fileSize'];
            v_FileType = fileDetails['fileType'];
            v_DurationMs = fileDetails['durationMs'];
            v_BitrateBps = fileDetails['bitrateBps'];
            v_CreationTime = fileDetails['creationTime'];
        }
        v_ProcessingStatus = processingDetails['processingStatus'];
        if (typeof suggestions !== "undefined") {
            v_ProcessingErrors = suggestions['processingErrors'];
            v_ProcessingWarnings = suggestions['processingWarnings'];
            v_ProcessingHints = suggestions['processingHints'];
            v_TagSuggestions = suggestions['tagSuggestions'];
        }
        var categoryRequest = gapi.client.youtube.videoCategories.list({
            id: v_CategoryId,
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
    videoHTML = "<iframe width=\"480\" height=\"360\" src=\"" + link + "\" frameborder=\"0\" allowfullscreen></iframe>";
    thumbnailHTML = "<p><img data-src=\"holder.js/120x90\" src=\"" + v_Thumb_URL + "\"></p>";

    newHTML = newHTML + "<hr><div class=\"panel panel-primary\">";
    newHTML = newHTML + "<div class=\"panel-heading\"><h4>" + v_Title + "</h4></div>";
    newHTML = newHTML + "<div class=\"panel-body\">";
    newHTML = newHTML + thumbnailHTML;
    newHTML = newHTML + "<p>Video ID: " + videoID + "</p>";
    newHTML = newHTML + "<p>Video Category: " + v_CategoryTitle + "</p>";
    newHTML = newHTML + categoryDropdownHTML;
    newHTML = newHTML + "<p>Description: " + v_Description + "</p>";
    if (typeof v_TagsList !== "undefined") {
        newHTML = newHTML + "<p>Tags (Separte using commas[,]): <div class=\"well\">" + v_TagsList.toString() + "</div>";
    }
    else
        newHTML = newHTML + "<p>Tags (Separte using commas[,]): <div class=\"well\"></div>";
    newHTML = newHTML + "<h4>[STATISICS]</h4>";
    newHTML = newHTML + "<p>View Count: " + v_ViewCount + "</p>";
    newHTML = newHTML + "<p>Like Count: " + v_LikeCount + "</p>";
    newHTML = newHTML + "<p>Dislike Count: " + v_DislikeCount + "</p>";
    newHTML = newHTML + "<p>Favorite Count: " + v_FavoriteCount + "</p>";
    newHTML = newHTML + "<p>Comment Count: " + v_CommentCount + "</p>";
    newHTML = newHTML + "<h4>[STATUS]</h4>";
    newHTML = newHTML + "<p>Privacy Status: " + v_PrivacyStatus + "</p>";
    newHTML = newHTML + "<p>Upload Status: " + v_UploadStatus + "</p>";
    if (v_UploadStatus === 'failed') {
        v_FailureReason = status['failureReason'];
        newHTML = newHTML + "<p>FAILURE REASON: " + v_FailureReason + "</p>";
    }
    if (v_UploadStatus === 'rejected') {
        v_RejectionReason = status['rejectionReason'];
        newHTML = newHTML + "<p>REJECTION REASON: " + v_RejectionReason + "</p>";
    }
    newHTML = newHTML + "<p>License Status: " + v_License + "</p>";
    if (typeof fileDetails !== "undefined") {
        newHTML = newHTML + "<h4>[FILE DETAILS]</h4>";
        newHTML = newHTML + "<p>File Name: " + v_FileName + "</p>";
        newHTML = newHTML + "<p>File Size: " + v_FileSize + "</p>";
        newHTML = newHTML + "<p>File Type: " + v_FileType + "</p>";
        newHTML = newHTML + "<p>Duration: " + v_DurationMs / 1000 + " seconds</p>";
        newHTML = newHTML + "<p>Bitrate: " + v_BitrateBps + " bps (bits per second)</p>";
        newHTML = newHTML + "<p>Date Created: " + v_CreationTime + "</p>";
    }
    newHTML = newHTML + "<h4>[VIDEO PROCESSING]</h4>";
    newHTML = newHTML + "<p>Processing Status: " + v_ProcessingStatus + "</p>";
    if (v_ProcessingStatus === 'failed') {
        v_processingFailureReason = processingDetails['processingFailureReason'];
        newHTML = newHTML + "<p>PROCESSING FAILURE REASON: " + v_processingFailureReason + "</p>";
    }
    if (v_ProcessingStatus === 'processing') {
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
    if (typeof v_ProcessingErrors !== "undefined")
        newHTML = newHTML + "<p>Processing Erros (Causes a failed upload): " + v_ProcessingErrors.toString() + "</p>";
    if (typeof v_ProcessingWarnings !== "undefined")
        newHTML = newHTML + "<p>Processing Warnings (Causes difficulties in processing): " + v_ProcessingWarnings.toString() + "</p>";
    if (typeof v_ProcessingHints !== "undefined")
        newHTML = newHTML + "<p>Processing Hints (Hints for improving processing of video): " + v_ProcessingHints.toString() + "</p>";
    if (typeof v_TagSuggestions !== "undefined")
        newHTML = newHTML + "<p>Tag Suggestions: " + v_TagSuggestions.toString() + "</p>";
    newHTML = newHTML + "</div></div>";
    populateWithHTML();
}

// Add HTML to page
function populateWithHTML() {
    document.getElementById("search-container").innerHTML = newHTML;
    document.getElementById("VideoPic").innerHTML = videoHTML;
    $('#update-button').attr('disabled', false);
}

////////////////////////////////////////////////////////////////////////////
//                         -END OF VIDEO SECTION -
////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////
//                              USER SELECTION
//                       CHANGES TO ANY DOM COMPONENTS
////////////////////////////////////////////////////////////////////////////

// Retrieve the next page of playlists.
function nextPlaylists() {
    getUserPlaylists(false, nextPlaylistToken);
}

// Retrieve the previous page of videos.
function previousPlaylists() {
    getUserPlaylists(false, prevPlaylistToken);
}

// Retrieve the next page of videos.
function nextVids() {
    requestVideoPlaylist(uploadsPlaylistId, nextPageToken);
}

// Retrieve the previous page of videos.
function previousVids() {
    requestVideoPlaylist(uploadsPlaylistId, prevPageToken);
}

// User selected a playlist
function selectedPlaylist(sel) {
    SelectedPlaylistId = sel.options[sel.selectedIndex].value;
    SelectedPlaylist = sel.options[sel.selectedIndex].text;
}

// User selected a video
function selectedVideo(sel) {
    var val = sel.options[sel.selectedIndex].value;
    getVideoData(val, true);
}

// User selected a playlist in the video defaults section
function VideoAddPlaylist(sel) {
    videoSelectedPlaylistId = sel.options[sel.selectedIndex].value;
    videoSelectedPlaylist = sel.options[sel.selectedIndex].text;
}

////////////////////////////////////////////////////////////////////////////
//                         -END OF USER SELECTION -
////////////////////////////////////////////////////////////////////////////
