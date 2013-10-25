// Once the api loads call enable the search box.
function handleAPILoaded() {
   $('#search-button').attr('disabled', false);
}

// Search for a given string.
function search() {
   videoID = $('#vidId').val();
   var request = gapi.client.youtube.videos.list({
      id: videoID,
      part: 'snippet','statistics'
   });

   request.execute(function(response) {
      link = "//www.youtube.com/embed/" + videoID;
      var str = JSON.stringify(response.result);
      data = JSON.parse(str);
      v_Title = data['items'][0]['snippet']['title'];
      v_Description = data['items'][0]['snippet']['description'];
      v_Thumb_URL = data['items'][0]['snippet']['thumbnails']['default']['url'];
      v_ViewCount = data['items'][0]['statistics']['viewCount'];
      v_LikeCount = data['items'][0]['statistics']['likeCount'];
      v_DislikeCount = data['items'][0]['statistics']['dislikeCount'];
      v_FavoriteCount = data['items'][0]['statistics']['favoriteCount'];
      v_CommentCount = data['items'][0]['statistics']['commentCount'];
      newHTML = "<iframe width=\"480\" height=\"360\" src=\"" + link + "\" frameborder=\"0\" allowfullscreen></iframe>";
      newHTML = newHTML + "<h3>Title: " + v_Title + "</h3>";
      newHTML = newHTML + "<h4>Description: " + v_Description + "</h4>";
      newHTML = newHTML + "<p>View Count: " + v_ViewCount + "</p>";
      newHTML = newHTML + "<p>Like Count: " + v_LikeCount + "</p>";
      newHTML = newHTML + "<p>Dislike Count: " + v_DislikeCount + "</p>";
      newHTML = newHTML + "<p>Favorite Count: " + v_FavoriteCount + "</p>";
      newHTML = newHTML + "<p>Comment Count: " + v_CommentCount + "</p>";
      thumbnailHTML = "<img class=\"img-circle\" src=\""+ v_Thumb_URL +"\" data-src=\"holder.js/140x140\" alt=\"Thumbnail\">";
      document.getElementById("search-container").innerHTML = newHTML;
      document.getElementById("VideoPic").innerHTML = newHTML;
   });
}