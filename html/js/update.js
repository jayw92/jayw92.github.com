// Once the api loads call enable the search box.
function handleAPILoaded() {
    $('#search-button').attr('disabled', false);
}

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
var c_CategoryId, c_Description, c_License, c_PrivacyStatus, c_TagsList, c_Title;

var cateSnip, CategoryTitleReturn;
// UPDATE VIDEO FUNCTION

function updateVideo() {
    c_Title = $('#c_Title').val();
    c_Description = $('#c_Description').val();
    c_TagsList = $('#c_TagsList').val().split(",");
    snippet['title'] = c_Title;
    snippet['description'] = c_Description;
    snippet['tags'] = c_TagsList;
    updateRequest = gapi.client.youtube.videos.update({
        part: 'snippet',
        resource: {id: videoID, snippet: snippet}
    });
    updateRequest.execute(function(u_response) {
        var u_result = u_response.result;
        u_str = JSON.stringify(u_response.result);
        if (u_result) {
            $('#error-update').html("<div class=\"alert alert-success\"><strong>Success!</strong> Updated video details.</div>");
        } else {
            $('#error-update').html("<div class=\"alert alert-danger\"><strong>Failed!</strong> Could not update video details.</div>");
        }
    });
}

// SEARCH FUNCTION
function search() {
    videoID = $('#vidId').val();
    link = "//www.youtube.com/embed/" + videoID;
    var request = gapi.client.youtube.videos.list({
        id: videoID,
        part: 'snippet,statistics,status,fileDetails,processingDetails,suggestions'
    });
    request.execute(function(response) {
        str = JSON.stringify(response.result);
        data = JSON.parse(str);
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
            str2 = JSON.stringify(res.result);
            snip = JSON.parse(str2);
            v_CategoryTitle = snip['items'][0]['snippet']['title'];
            addSearchHTML();
        });
    });
}

function getCategoryTitle(id) {
    var categoryTitleRequest = gapi.client.youtube.videoCategories.list({
        id: "" + id,
        part: 'snippet'
    });
    categoryTitleRequest.execute(function(res) {
        str3 = JSON.stringify(res.result);
        cateSnip = JSON.parse(str3);
        CategoryTitleReturn = cateSnip['items'][0]['snippet']['title'];
        console.log(CategoryTitleReturn);
    });
}

function addSearchHTML() {
    videoHTML = "<iframe width=\"480\" height=\"360\" src=\"" + link + "\" frameborder=\"0\" allowfullscreen></iframe>";
    thumbnailHTML = "<p><img data-src=\"holder.js/120x90\" src=\"" + v_Thumb_URL + "\"></p>";
    newHTML = "<hr><div class=\"panel panel-primary\">";
    newHTML = newHTML + "<div class=\"panel-heading\">" + v_Title + "</div>";
    newHTML = newHTML + "<div class=\"panel-body\">";
    newHTML = newHTML + thumbnailHTML;
    newHTML = newHTML + "<p class=\"updatefield\">Update Title: <input class=\"form-control\" id=\"c_Title\" type=\"text\" value=\"" + v_Title + "\"></p>";
    newHTML = newHTML + "<p>Video Category: " + v_CategoryTitle + "</p>";
    var index = 0;
    var categoryDropdownHTML = "<p class=\"updatefield\">Select Category: <select id=\"c_CategoryId\">\n";
    getCategoryTitle(index);
    while (typeof CategoryTitleReturn !== "undefined") {
        categoryDropdownHTML = categoryDropdownHTML + "<option value=\"" + index + "\">" + CategoryTitleReturn + "</option>\n";
        index++;
        getCategoryTitle(index);
    }
    categoryDropdownHTML = categoryDropdownHTML + "</select></p>";
    newHTML = newHTML + categoryDropdownHTML;
    newHTML = newHTML + "<p>Description: " + v_Description + "</p>";
    newHTML = newHTML + "<p class=\"updatefield\">Update Description (Separte using commas[,]: <textarea class=\"form-control\" id=\"c_Description\" row=\"5\" cols=\"60\">" + v_Description + "</textarea></p>";
    if (typeof v_TagsList !== "undefined") {
        newHTML = newHTML + "<p>Tags: " + v_TagsList.toString() + "</p>";
        newHTML = newHTML + "<p class=\"updatefield\">Update Tags (Separte using commas[,]): <textarea class=\"form-control\" id=\"c_TagsList\" row=\"3\" cols=\"40\">" + v_TagsList.toString() + "</textarea></p>";
    }
    else
        newHTML = newHTML + "<p class=\"updatefield\">Add Tags: <textarea class=\"form-control\" id=\"c_TagsList\" row=\"5\" cols=\"60\"></textarea></p>";
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
    document.getElementById("search-container").innerHTML = newHTML;
    document.getElementById("VideoPic").innerHTML = videoHTML;
    $('#update-button').attr('disabled', false);
}