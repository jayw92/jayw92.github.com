
// GLOBAL VARIABLES
var videoID, link, data, snippet, snip, statistics, vidStatus, fileDetails, processingDetails, suggestions;
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
var selected_Profile, profilesHTML, userID;

////////////////////////////////////////////////////////////////////////////
//                         FIRST PAGE LOAD FUNCTIONS
////////////////////////////////////////////////////////////////////////////

// Once the api loads call enable the search box.
function handleAPILoaded() {
   enableForm();
   $('#uploadsSelectionBox').attr('disabled', true);
   $('#profileSelector').attr('disabled', true);
   $('#accessProfilesButton').attr('disabled', true);
   $('#loadProfilebutton').attr('disabled', true);
   $('#deleteProfilebutton').attr('disabled', true);
   $('#update-status').html("");
   categoryDropdownHTML = playlistsDropdownHTML = uploadsDropdownHTML = videoHTML = selected_Profile = profilesHTML = "";
   videoSelectedPlaylistId = thumbnail_url = "";
   // Load profiles already saved in storage
   getProfiles();
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
      $('#pro_CategoryId').html(categoryDropdownHTML);
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
      userID = response.result.items[0].contentDetails.googlePlusUserId;
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
      maxResults: 50
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
         $('#pro_PlaylistId').html(playlistsDropdownHTML);

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
   var request = gapi.client.youtube.thumbnails.set({
      videoID: videoID,
      media_body: thumbnail_url
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
   if (vidStatus['embeddable'])
      $('#c_Embeddable').prop("checked", true);
   if (vidStatus['publicStatsViewable'])
      $('#c_PublicStatsViewable').prop("checked", true);
   $('#c_CategoryId').val(snippet['categoryId']);
   $('#c_PrivacyStatus').val(vidStatus['privacyStatus']);
   $('#c_License').val(vidStatus['license']);
   $('#c_Description').val(snippet['description']);
   if (typeof snippet['tags'] !== "undefined")
      $('#c_TagsList').val(stringOfArray(snippet['tags']));
}

// Apply video default settings to selected video
function updateVideo() {
   c_Title = $('#c_Title').val();
   c_Description = $('#c_Description').val();
   c_TagsList = arrayOfString($('#c_TagsList').val());

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
   vidStatus['license'] = c_License;
   vidStatus['privacyStatus'] = c_PrivacyStatus;
   vidStatus['embeddable'] = c_Embeddable;
   vidStatus['publicStatsViewable'] = c_PublicStatsViewable;

   var requestOptions = {
      part: 'snippet,status',
      resource: {id: videoID, snippet: snippet, status: vidStatus}
   };

   updateRequest = gapi.client.youtube.videos.update(requestOptions);

   updateRequest.execute(function(response) {
      var res = response.result;
      if (res) {
         if (videoSelectedPlaylistId !== "") {
            addToPlaylist(videoID);
         }
         if (thumbnail_url !== "") {
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
      vidStatus = data['items'][0]['status'];
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
      newHTML = newHTML + "<p>Tags (ex: tag1 tag2 \"tag3 tag3\"): <div class=\"well\">" + stringOfArray(snippet['tags']) + "</div>";
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
   newHTML = newHTML + "<p>Embeddable: " + vidStatus['embeddable'] + "</p>";
   newHTML = newHTML + "<p>Public Stats Viewable: " + vidStatus['publicStatsViewable'] + "</p>";
   newHTML = newHTML + "<p>Privacy Status: " + vidStatus['privacyStatus'] + "</p>";
   newHTML = newHTML + "<p>Upload Status: " + vidStatus['uploadStatus'] + "</p>";
   if (vidStatus['uploadStatus'] === 'failed') {
      v_FailureReason = vidStatus['failureReason'];
      newHTML = newHTML + "<p>FAILURE REASON: " + v_FailureReason + "</p>";
   }
   if (vidStatus['uploadStatus'] === 'rejected') {
      v_RejectionReason = vidStatus['rejectionReason'];
      newHTML = newHTML + "<p>REJECTION REASON: " + v_RejectionReason + "</p>";
   }
   newHTML = newHTML + "<p>License Status: " + vidStatus['license'] + "</p>";
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
//                        DEFAULTS PROFILES FUNCTIONS
////////////////////////////////////////////////////////////////////////////

function store_template(data) {
   return $.post("http://ec2-54-236-71-135.compute-1.amazonaws.com/store_video_template.py", data)
           .done(function(data) {
              console.log("[Data is stored.]");
              console.log(data);
           });
}
function get_template(id, title) {
   return $.post("http://ec2-54-236-71-135.compute-1.amazonaws.com/retrieve_video_template.py", {username: id, template_title: title})
           .done(function(data) {
              if ($.isEmptyObject(data))
                 console.log("ERROR: Could not get data from server."); //The username was not in the database or an error occurred.
              else {
                 console.log("[Received stored data.]");
                 return data;
              }
           });
}

// Check & setup profiles selector
function getProfiles() {
   $('#loadProfilebutton').attr('disabled', true);
   $('#deleteProfilebutton').attr('disabled', true);

   if (typeof (Storage) !== "undefined")
   {
      // Yes! localStorage and sessionStorage support!
      $('#accessProfilesButton').attr('disabled', false);
      var profilelist = JSON.parse(localStorage.getItem('Profiles'));
      if (profilelist !== null) {
         profilesHTML = "";
         for (var pname in profilelist)
         {
            if (profilelist.hasOwnProperty(pname)) {
               profilesHTML = profilesHTML + "<option value=\"" + pname + "\">" + pname + "</option>\n";
            }
         }
         $('#profileSelector').attr('disabled', false);
         $('#accessProfilesButton').attr('disabled', false);
         $('#profileSelector').html(profilesHTML);
      }
   }
   else
   {
      // Sorry! No web storage support..
      $('#update-status').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> Browser doesn't support web Storage.</div>");

   }
}

// Load selected profile to the main data form
function loadSelectorProfile() {
   var profile = get_template(userID, selected_Profile);

//   $('#c_Title').val(profile['Title']);
//   if (profile['Embeddable'])
//      $('#c_Embeddable').prop("checked", true);
//   if (profile['PublicStatsViewable'])
//      $('#c_PublicStatsViewable').prop("checked", true);
//   $('#c_CategoryId').val(profile['Category']);
//   $('#c_PlaylistId').val(profile['Playlist']);
//   $('#c_PrivacyStatus').val(profile['PrivacyStatus']);
//   $('#c_License').val(profile['License']);
//   $('#c_Description').val(profile['Description']);
//   var tagArr = arrayOfString($('#c_TagsList').val());
//   if (typeof profile['Tags'] !== "undefined") {
//      var profileArr = profile['Tags'];
//      var bothArr = tagArr.concat(profileArr);
//      $('#c_TagsList').val(stringOfArray(bothArr));
//   }
}

// Delete selected profile
function deleteSelectorProfile() {
   var profilelist = JSON.parse(localStorage.getItem('Profiles'));
   delete profilelist[selected_Profile];
   localStorage.setItem('Profiles', JSON.stringify(profilelist));
   getProfiles();
}

// Selector onchange() for profiles
function selectedProfile(sel) {
   selected_Profile = sel.options[sel.selectedIndex].text;
   load_Profile_Data();
   $('#SelectProfileModalLabel').html('Profile Settings - ' + selected_Profile);
   $('#loadProfilebutton').attr('disabled', false);
   $('#deleteProfilebutton').attr('disabled', false);
}

// Load selected Profile into the form for profile settings
function load_Profile_Data() {

   var profile = get_template(userID, selected_Profile);
//   var profilelist = JSON.parse(localStorage.getItem('Profiles'));
//   var profile = profilelist[selected_Profile];
//
//   $('#pro_Title').val(profile['Title']);
//   if (profile['Embeddable'])
//      $('#pro_Embeddable').prop("checked", true);
//   if (profile['PublicStatsViewable'])
//      $('#pro_PublicStatsViewable').prop("checked", true);
//   $('#pro_CategoryId').val(profile['Category']);
//   $('#pro_PlaylistId').val(profile['Playlist']);
//   $('#pro_PrivacyStatus').val(profile['PrivacyStatus']);
//   $('#pro_License').val(profile['License']);
//   $('#pro_Description').val(profile['Description']);
//   if (typeof profile['Tags'] !== "undefined")
//      $('#pro_TagsList').val(stringOfArray(profile['Tags']));
}

// Selected to save to a new profile
function saveNewProfile() {
   var profile_name = $('#profile_name').val();
   saveProfile(profile_name);
}

// Save profile to the selected profile
function saveSelectedProfile() {
   if (selected_Profile !== "") {
      saveProfile(selected_Profile);
   }
   else {
      $('#profilesave-status').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> No saved profile selected.</div>");
   }
}

// Save any profile by profile name
function saveProfile(name) {

//   if (typeof (Storage) !== "undefined")
//   {
      // Yes! localStorage and sessionStorage support!
      var profilelist = JSON.parse(localStorage.getItem('Profiles'));
      if (profilelist === null) {
         profilelist = {};
      }

      var profile = {};
      profile.Title = $('#pro_Title').val();
      profile.Description = $('#pro_Description').val();

      profile.Tags = $('#pro_TagsList').val();

      var ex = document.getElementById("pro_CategoryId");
      profile.Category = ex.options[ex.selectedIndex].value;
      ex = document.getElementById("pro_PlaylistId");
      profile.Playlist = ex.options[ex.selectedIndex].value;
      ex = document.getElementById("pro_License");
      profile.License = ex.options[ex.selectedIndex].value;
      ex = document.getElementById("pro_PrivacyStatus");
      profile.PrivacyStatus = ex.options[ex.selectedIndex].value;
      ex = document.getElementById("pro_Embeddable");
      profile.Embeddable = ex.checked;
      ex = document.getElementById("pro_PublicStatsViewable");
      profile.PublicStatsViewable = ex.checked;

      profilelist[name] = profile;

      localStorage.setItem('Profiles', JSON.stringify(profilelist));
      newTemplate = {
         'username': userID,
         'template_title': name,
         'video_title': profile.Title,
         'video_embeddable': profile.Embeddable,
         'video_public_stats': profile.PublicStatsViewable,
         'video_category': profile.Category,
         'playlist': profile.Playlist,
         'privacy_status': profile.PrivacyStatus,
         'video_license': profile.License,
         'description': profile.Description,
         'tags': profile.Tags
      };
      store_template(newTemplate);
      $('#SelectProfileModal').modal('hide');
      getProfiles();
//   }
//   else
//   {
      // Sorry! No web storage support..
//      $('#profilesave-status').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> Browser doesn't support web Storage.</div>");

//   }
}


////////////////////////////////////////////////////////////////////////////
//                ARRAY FUNCTONS
////////////////////////////////////////////////////////////////////////////


// Finds and removes duplicates in arrays
function filterArrayDuplicates(arr) {
   var sortedArr = [];
   $.each(arr, function(i, el) {
      if ($.inArray(el, sortedArr) === -1)
         sortedArr.push(el);
   });
   return sortedArr;
}

// Array to String with spaces
function stringOfArray(arr) {
   var array = filterArrayDuplicates(arr);
   var str = "";
   for (var i in array) {
      str = str + array[i] + " ";
   }
   return str;
}

// String to Array filtering spaces and quotation marks
function arrayOfString(str) {
   var arr = str.match(/(?:[^\s"]+|"[^"]*")+/g);
   var array = filterArrayDuplicates(arr);
   return array;
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
