// Once the api loads call enable the search box.
function handleAPILoaded() {
    $('#search-button').attr('disabled', false);
    $('#update-button').attr('disabled', false);
}

// GLOBAL VARIABLES
var videoID, link, data, snippet, snip, statistics, status, fileDetails, processingDetails, suggestions;
var v_BitrateBps, v_CategoryId, v_CategoryTitle, v_CommentCount, v_CreationTime, v_Description;
var v_DislikeCount, v_DurationMs, v_FailureReason, v_FavoriteCount, v_FileName, v_FileSize, v_FileType;
var v_License, v_LikeCount, v_PartsProcessed, v_PartsProcessedPercent, v_PartsTotal, v_PrivacyStatus;
var v_ProcessingErrors, v_ProcessingHints, v_ProcessingStatus, v_ProcessingWarnings, v_processingFailureReason;
var v_RejectionReason, v_TagSuggestions, v_TagsList, v_Thumb_URL, v_Title, v_timeLeftMs;
var v_UploadStatus, v_ViewCount;
var videoHTML, newHTML, str, str2;

// UPDATE VIDEO FUNCTION

function updateVideo() {
    videoID = $('#vidId').val();

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

        v_FileName = fileDetails['fileName'];
        v_FileSize = fileDetails['fileSize'];
        v_FileType = fileDetails['fileType'];
        v_DurationMs = fileDetails['durationMs'];
        v_BitrateBps = fileDetails['bitrateBps'];
        v_CreationTime = fileDetails['creationTime'];

        v_ProcessingStatus = processingDetails['processingStatus'];

        v_ProcessingErrors = suggestions['processingErrors'];
        v_ProcessingWarnings = suggestions['processingWarnings'];
        v_ProcessingHints = suggestions['processingHints'];
        v_TagSuggestions = suggestions['tagSuggestions'];
    });


    var categoryRequest = gapi.client.youtube.videoCategories.list({
        id: v_CategoryId,
        part: 'snippet'
    });

    categoryRequest.execute(function(res) {
        str2 = JSON.stringify(res.result);
        snip = JSON.parse(str2);
        v_CategoryTitle = snip['items'][0]['snippet']['title'];
    });


    videoHTML = "<iframe width=\"480\" height=\"360\" src=\"" + link + "\" frameborder=\"0\" allowfullscreen></iframe>";
    thumbnailHTML = "<p><img src=\"" + v_Thumb_URL + "\" width=\"120\" height=\"90\" alt=\"Thumbnail\"></p>";

    newHTML = thumbnailHTML + "<h3>Title: " + v_Title + "</h3>";
    newHTML = newHTML + "<p>Video Category: " + v_CategoryTitle + "</p>";
    newHTML = newHTML + "<p>Description: " + v_Description + "</p>";
    newHTML = newHTML + "<p>Tags: " + v_TagsList.toString() + "</p>";

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

    newHTML = newHTML + "<h4>[FILE DETAILS]</h4>";
    newHTML = newHTML + "<p>File Name: " + v_FileName + "</p>";
    newHTML = newHTML + "<p>File Size: " + v_FileSize + "</p>";
    newHTML = newHTML + "<p>File Type: " + v_FileType + "</p>";
    newHTML = newHTML + "<p>Duration: " + v_DurationMs / 1000 + " seconds</p>";
    newHTML = newHTML + "<p>Bitrate: " + v_BitrateBps + " bps (bits per second)</p>";
    newHTML = newHTML + "<p>Date Created: " + v_CreationTime + "</p>";

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
    newHTML = newHTML + "<p>Processing Erros(Causes a failed upload): " + v_ProcessingErrors.toString() + "</p>";
    newHTML = newHTML + "<p>Processing Warnings(Causes difficulties in processing): " + v_ProcessingWarnings.toString() + "</p>";
    newHTML = newHTML + "<p>Processing Hints(Hints for improving processing of video): " + v_ProcessingHints.toString() + "</p>";
    newHTML = newHTML + "<p>Tag Suggestions: " + v_TagSuggestions.toString() + "</p>";

    document.getElementById("search-container").innerHTML = newHTML;
    document.getElementById("VideoPic").innerHTML = videoHTML;
}