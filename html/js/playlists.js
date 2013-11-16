
// GLOBAL VARIABLES
var videoID, link, data, snippet, snip, statistics, status, fileDetails, processingDetails, suggestions;
var v_CategoryTitle, v_FailureReason, v_PartsProcessed, v_PartsProcessedPercent, v_PartsTotal, v_processingFailureReason;
var v_RejectionReason, v_Thumb_URL, v_timeLeftMs;

var videoHTML, newHTML, str, str2, str3;
var u_str, updateRequest;

var c_CategoryId, c_Description, c_License, c_PrivacyStatus, c_TagsList, c_Title, c_Embeddable, c_PublicStatsViewable;

var nextPageToken, prevPageToken, playlistItems, uploadsPlaylistId, uploadsDropdownHTML, channelId;

var prevPlaylistToken, nextPlaylistToken, playlists, playlistsDropdownHTML, SelectedPlaylistId, SelectedPlaylist;
var p_Title, p_Description, p_PrivacyStatus, p_Tags, videoSelectedPlaylistId, videoSelectedPlaylist;

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
    SelectedPlaylistId = "0";
    getCategoryList();
}

// Default form looks for page objects
function enableForm() {
    $('#Playlists-status').html("");
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

// Delete a playlist by ID
function deletePlaylist(pID) {
    var requestOptions = {
        id: pID
    }
    var request = gapi.client.youtube.playlists.list(requestOptions);
    request.execute(function(response) {
        
    });
}

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
            $('#addlist-button').attr('disabled', false);
            $('#Playlists-status').html("<div class=\"alert alert-success\"><strong>Success!</strong> Found playlists under this account.</div>");
            playlistsDropdownHTML = "";
            var index = 0;
            while (typeof playlists[index] !== "undefined") {
                var pTitle = playlists[index].snippet.title;
                var playlistid = playlists[index].id;
                playlistsDropdownHTML = playlistsDropdownHTML + "<option value=\"" + playlistid + "\">" + pTitle + "</option>\n";
                index++;
            }
            $('#playlistsSelectionBox').html(playlistsDropdownHTML);
            $('#playlistsSelectionBox').attr('disabled', false);
            playlistsDropdownHTML = playlistsDropdownHTML + "<option selected=\"selected\" value=\"" + 0 + "\">Select a Playlist</option>\n"
            $('#c_PlaylistId').html(playlistsDropdownHTML);

        } else {
            $('#Playlists-status').html("<div class=\"alert alert-danger\"><strong>Sorry!</strong> Could not find any playlists under this account.</div>");
        }
    });
}

// Get playlist using playlist ID
function requestPlaylistItems(playlistID, pageToken) {
    var requestOptions = {
        playlistId: playlistID,
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

// Create a playlist
function createPlaylist(title, des, privacy, tags) {
    var request = gapi.client.youtube.playlists.insert({
        part: 'snippet,status',
        resource: {
            snippet: {
                title: title,
                description: des,
                tags: tags
            },
            status: {
                privacyStatus: privacy
            }
        }
    });
    request.execute(function(response) {
        var result = response.result;
        if (result) {
            getUserPlaylists(false);
            $('#addlist-status').html('<div class="alert alert-success"><strong>Success!</strong> Added new playlist.</div>');
        } else {
            $('#addlist-status').html('<div class="alert alert-danger"><strong>Sorry!</strong> Could not add playlist.</div>');
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


// Load selected video data to the video default form
function loadPlaylistForm() {
    $('#p_Title').val(snippet['title']);
    $('#p_PrivacyStatus').val(status['privacyStatus']);
    $('#p_License').val(status['license']);
    $('#p_Description').val(snippet['description']);
    if (typeof snippet['tags'] !== "undefined")
        $('#p_Tags').val(snippet['tags'].toString());
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
    requestPlaylistItems(SelectedPlaylistId, nextPageToken);
}

// Retrieve the previous page of videos.
function previousVids() {
    requestPlaylistItems(SelectedPlaylistId, prevPageToken);
}

// User selected a playlist
function selectedPlaylist(sel) {
    SelectedPlaylistId = sel.options[sel.selectedIndex].value;
    SelectedPlaylist = sel.options[sel.selectedIndex].text;
    $('#deletelist-button').attr('disabled', false);
}

// Delete selected playlist
function deleteSelectedPlaylist() {
    deletePlaylist(SelectedPlaylistId);
}

// Add New Playlist selected
function addNewPlaylist(){
    p_Title = $('#p_Title').val();
    p_Description = $('#p_Description').val();
    p_Tags = $('#p_Tags').val().split(",");

    var ex = document.getElementById("p_PrivacyStatus");
    p_PrivacyStatus = ex.options[ex.selectedIndex].value;
    createPlaylist(p_Title, p_Descrption, p_PrivacyStatus, p_Tags);
    SelectedPlaylistId = "0";
}

// User selected a video
function selectedVideo(sel) {
    videoID = sel.options[sel.selectedIndex].value;
    getVideoData(videoID, true);
}

// User selected a playlist in the video defaults section
function VideoAddPlaylist(sel) {
    videoSelectedPlaylistId = sel.options[sel.selectedIndex].value;
    videoSelectedPlaylist = sel.options[sel.selectedIndex].text;
}

////////////////////////////////////////////////////////////////////////////
//                         -END OF USER SELECTION -
////////////////////////////////////////////////////////////////////////////
