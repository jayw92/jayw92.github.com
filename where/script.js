//Where is... Assignment - Jay Wang: March 4, 2013

//Form of elements in array traindata:
//    [Station name, location, station details, distance from user, keys[], platforms[], marker]
var request, cur_lat, cur_lng, locale, mapOptions, map, marker, infowindow, traindata, parsed;

//Set default values for globals
function makeVars(){
   request = new XMLHttpRequest();

   cur_lat = 0;
   cur_lng = 0;
   locale = new google.maps.LatLng(cur_lat, cur_lng);

   mapOptions = {
      zoom: 13,
      center: locale,
      mapTypeId: google.maps.MapTypeId.ROADMAP
   };

   infowindow = new google.maps.InfoWindow();

   traindata = new Array();
   parsed = new Array();

   map = new google.maps.Map(document.getElementById("map"), mapOptions);
   map.panTo(locale);
}

//Main function, sets up default map for site and tries to get location of user
function setupMap(){
   makeVars();
   getLoc();
}

//Get location of user and update center of map
function getLoc(){
   //Check if browser works with geolocation
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
         cur_lat = position.coords.latitude;
         cur_lng = position.coords.longitude;

         //Move to user location
         UpdateMap('');

         //Find Carmen and Waldo
         findCarmenWaldo();

         //Set up Stations
         setupStations();
      });
   }
   else {
      alert("Geolocation is not supported by your web browser.");
   }
}

//Update map
function UpdateMap(str){
   //Go to current location
   locale = new google.maps.LatLng(cur_lat, cur_lng);
   map.panTo(locale);

   //User marker
   image_user = 'images/star.png';
   //Set up marker for current location and its infowindow
   marker = new google.maps.Marker({
      icon: image_user,
      position: locale,
      title: 'You are here!'
   });
   marker.setMap(map);
   infowindow.setContent('<h3>Your Location</h3>' + '<p>(' + cur_lat + ', ' + cur_lng + ')</p>'+str);
   infowindow.open(map, marker);
   google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent('<h3>Your Location</h3>' + '<p>(' + cur_lat + ', ' + cur_lng + ')</p>'+str);
      infowindow.open(map, marker);
      map.panTo(marker.position);
   });
}

//Finding Waldo and Carmen
function findCarmenWaldo(){
   //Get a3.json request
   request.open("GET", "http://messagehub.herokuapp.com/a3.json", true);
   request.send(null);
   request.onreadystatechange = function(){
      if (request.readyState == 4 && request.status == 200) {
         waldo_lat = 0;
         waldo_lng = 0;
         waldo_note = "";
         carmen_lat = 0;
         carmen_lng = 0;
         carmen_note = "";
         data = JSON.parse(request.responseText);
         for (i = 0; i < data.length; i++){
            if (data[i]['name'] == 'Waldo'){
               //Get data from JSON and calculate distance from user location
               waldo_lat = data[i]['loc']['latitude'];
               waldo_lng = data[i]['loc']['longitude'];
               length = dist(waldo_lat, waldo_lng, cur_lat, cur_lng);
               waldo_note = '<h2>[Waldo]</h2> <br />'
               + data[i]['loc']['note'] +
               '<br />Distance from you: '+ length + ' miles';
               waldo_locale = new google.maps.LatLng(waldo_lat, waldo_lng);

               //Marker for Waldo
               image1 = 'images/waldo.png';
               marker_waldo = new google.maps.Marker({
                  icon: image1,
                  position: waldo_locale,
                  title: "waldo"
               });
               marker_waldo.setMap(map);
               google.maps.event.addListener(marker_waldo, 'click', function() {
                  infowindow.setContent(waldo_note);
                  infowindow.open(map, marker_waldo);
                  map.panTo(marker_waldo.position);
               });
            }
            if (data[i]['name'] == 'Carmen Sandiego'){
               //Get data from JSON and calculate distance from user location
               carmen_lat = data[i]['loc']['latitude'];
               carmen_lng = data[i]['loc']['longitude'];
               length = dist(carmen_lat, carmen_lng, cur_lat, cur_lng);
               carmen_note = '<h2>[Carmen]</h2> <br />'
               + data[i]['loc']['note'] +
               '<br />Distance from you: '+ length + ' miles';
               carmen_locale = new google.maps.LatLng(carmen_lat, carmen_lng);

               //Marker for Carmen
               image2 = 'images/carmen.png';
               marker_carmen = new google.maps.Marker({
                  icon: image2,
                  position: carmen_locale,
                  title: "carmen"
               });
               marker_carmen.setMap(map);
               google.maps.event.addListener(marker_carmen, 'click', function() {
                  infowindow.setContent(carmen_note);
                  infowindow.open(map, marker_carmen);
                  map.panTo(marker_carmen.position);
               });
            }
         }
      }
   }
}

function setupStations(){
   //Parse data from trainloc.txt into array traindata
   var request2 = new XMLHttpRequest();
   request2.open("GET", "trainloc.txt", true);
   request2.send(null);
   request2.onreadystatechange = function(){
      if (request2.readyState == 4 && request2.status == 200) {
         //Parsed array of the data received
         parsed = (request2.responseText).split('\n');

         for (x = 0; x < parsed.length; x++){
            //Parsed datastream for each line of data
            datastream = parsed[x].split(',');

            if (datastream[0] == 'Red'){
               index = -1;
               str = datastream[11]; //Station name
               datalength = traindata.length;

               //Find if traindata has the station already
               for (y = 0; y < datalength; y++){
                  if (traindata[y].indexOf(str) > -1)
                     index = y;
               }

               //Add train station data to traindata
               if (index == -1){
                  stop_lat = datastream[13];
                  stop_lng = datastream[14];
                  distance = dist(stop_lat, stop_lng, cur_lat, cur_lng); //Distance from User
                  stop_note = '<h3>' + datastream[11] + '</h3> <br />';
                  stop_loc = new google.maps.LatLng(stop_lat, stop_lng); //Location of Station
                  traindata[datalength] = [datastream[11], stop_loc, stop_note, distance, [datastream[1]], [datastream[2]]];
               }
               else if (index != -1){
                  traindata[index][4][1] = datastream[1];
                  traindata[index][5][1] = datastream[2];
               }
            }
         }
      }

   }

   //Get train times
   var request3 = new XMLHttpRequest();
   request3.open("GET", "http://mbtamap-cedar.herokuapp.com/mapper/redline.json", true);
   request3.send(null);
   request3.onreadystatechange = function(){
      if (request3.readyState == 4 && request3.status == 200) {
         redline_data = JSON.parse(request3.responseText);
         for (i = 0; i < redline_data.length; i++){
            key = redline_data[i]['PlatformKey'];
            arrive = redline_data[i]['InformationType'];
            value = useKey(key);
            if ((arrive != 'Arrived') && (value[1] != traindata.length)){
               plat_name = traindata[value[0]][5][value[1]];
               stop_note = traindata[value[0]][2] + plat_name + '[ Time: ' + redline_data[i]['TimeRemaining'] + ' ]<br />';
               traindata[value[0]][2] = stop_note;
            }
         }

         //Load markers and polyline
         image_trainstop = 'images/train.png';
         var train_path1 = new Array();
         //For branched path into Braintree
         var train_path2 = new Array();
         count2 = 1;

         closestI = 0;
         //Access traindata and perform on the array elements
         for (z = 0; z < traindata.length; z++){
            //Closest train station index
            if (traindata[z][3] <= traindata[closestI][3]){
               closestI = z;
               UpdateMap('<p>Closest station: '+traindata[z][0]+' (' + traindata[z][3] +' miles)</p>');
            }

            //Station markers
            mark_note = traindata[z][2];
            traindata[z][6] = new google.maps.Marker({
               icon: image_trainstop,
               position: traindata[z][1],
               title: traindata[z][0],
               content: mark_note
            });
            google.maps.event.addListener(traindata[z][6], 'click', function() {
               infowindow.setContent(this.content);
               infowindow.open(map, this);
               map.panTo(this.position);
            });
            traindata[z][6].setMap(map);

            if (z < 17)
               train_path1[z] = traindata[z][1];
            else{
               train_path2[0] = traindata[12][1];
               train_path2[count2] = traindata[z][1];
               count2++;
            }
         }

         var path1 = new google.maps.Polyline({
            path: train_path1,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 5
         });
         path1.setMap(map);
         var path2 = new google.maps.Polyline({
            path: train_path2,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 5
         });
         path2.setMap(map);
      }
   }
}

//Find [index, key_index] in traindata using key
function useKey(key){
   for (a = 0; a < traindata.length; a++){
      if (traindata[a][4][0] == key){
         return [a, 0];
      }
      else if (traindata[a][4][1] == key){
         return [a, 1];
      }
   }
   return [0, traindata.length];
}

//Converts to radians
function toRad(num){
   return (num * Math.PI)/180;
}

//Distance formula using Haversine (returns miles)
function dist(lat1, lon1, lat2, lon2){
   var R = 6371; // km
   var dLat = toRad(lat2-lat1);
   var dLon = toRad(lon2-lon1);
   var lat1 = toRad(lat1);
   var lat2 = toRad(lat2);

   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
   Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
   var d = R * c;

   return (d*0.621371); //miles conversion
}
