// Once the api loads call enable the search box.
function handleAPILoaded() {
   $('#search-button').attr('disabled', false);
}

// Search for a given string.
function search() {
   videoID = $('#vidId').val();
   var request = gapi.client.youtube.videos.list({
      id: videoID,
      part: 'snippet'
   });

   request.execute(function(response) {
      link = "//www.youtube.com/embed/" + videoID;
      var str = JSON.stringify(response.result);
      data = JSON.parse(request.responseText);
      document.getElementById("search-container").innerHTML = "<iframe width="480" height="360" src=link frameborder="0" allowfullscreen></iframe>";
   });
}