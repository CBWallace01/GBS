var map;
var markers = [];
var infowindow;
var accessToken;

function initMap(location) {
  initializeFB();
  var currLoc = location;
  infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: currLoc.coords.latitude, lng: currLoc.coords.longitude}, styles: [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{color: '#d59563'}]},
      {featureType: 'poi', elementType: 'labels.text.fill', stylers: [{color: '#d59563'}]},
      {featureType: 'poi.park', elementType: 'geometry', stylers: [{color: '#263c3f'}]},
      {featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{color: '#6b9a76'}]},
      {featureType: 'road', elementType: 'geometry', stylers: [{color: '#38414e'}]},
      {featureType: 'road', elementType: 'geometry.stroke', stylers: [{color: '#212a37'}]},
      {featureType: 'road', elementType: 'labels.text.fill', stylers: [{color: '#9ca5b3'}]},
      {featureType: 'road.highway', elementType: 'geometry', stylers: [{color: '#746855'}]},
      {featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{color: '#1f2835'}]},
      {featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{color: '#f3d19c'}]},
      {featureType: 'transit', elementType: 'geometry', stylers: [{color: '#2f3948'}]},
      {featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{color: '#d59563'}]},
      {featureType: 'water', elementType: 'geometry', stylers: [{color: '#17263c'}]},
      {featureType: 'water', elementType: 'labels.text.fill', stylers: [{color: '#515c6d'}]},
      {featureType: 'water', elementType: 'labels.text.stroke', stylers: [{color: '#17263c'}]}
  ]});
  google.maps.event.addListener(map, 'click', function(event) {
    clearAllMarkers();
    var marker = new google.maps.Marker({
      position: {lat: event.latLng.lat(), lng: event.latLng.lng()},
      map: map
    });
    markers.push(marker)
    getPlace(marker);
  });
}

function buildInfo(content,marker){
  infowindow.setContent(content);
  infowindow.open(map, marker);
  document.getElementById("postButton").addEventListener("click", function(){
    postToFB([document.getElementById("messageText").value,document.getElementById('location').value]);
  });
}

function getLocation() {
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(initMap);
  } else {
    initMap({coords:{latitude:0,longitude:0}});
  }
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    clearAllMarkers();
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

function createMarker(placeResult) {
  var marker = new google.maps.Marker({
    position: {lat: placeResult.geometry.location.lat(), lng: placeResult.geometry.location.lng()},
    map: map,
    title: placeResult.name
  });
  markers.push(marker);
}

function clearAllMarkers() {for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function generateContent(marker,places) {
  var outputHTML = '';
  outputHTML += '<h4>Test</h4>';
  outputHTML += '<p>Enter a message below.<br/>This message will be posed to your facebook at the location listed below.</p>';
  outputHTML += '<textarea id="messageText" type="text" placeholder="message" style="width:98%;height:100px"></textarea>';
  outputHTML += '<select id="location" style="float:left">';
  console.log(places.data[0].id);
  for (var i = 0; i < places.data.length; i++) {
    outputHTML += '<option value="'+places.data[i].id+'">'+places.data[i].name+'</option>';
  }
  outputHTML += '</select>';
  outputHTML += '<button id="postButton" style="float:right">Post to Facebook</button>';
  buildInfo(outputHTML,marker);
}

function postToFB(args) {
  console.log(args);
  FB.getAuthResponse();
  FB.api(
    "/me/feed",
    "POST",
    {
        "message": args[0],
        "place": args[1]
    },
    function (response) {
      if (response && !response.error) {
        alert("Posted Successfully");
        console.log(response);
      }else {
        alert("Error in Posting");
        console.log(response)
      }
    }
  );
}

function initializeFB() {
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '757342154390519',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.10'
    });
    FB.AppEvents.logPageView();
    fbLogin();
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
}

function fbLogin() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

function statusChangeCallback(response) {
  if(response.status == 'connected') {
    console.log(response);
    accessToken = response.authResponse.accessToken;
  }else{
    console.log('not logged in');
    FB.login(function(response){fbLogin();
    }, {scope: 'publish_actions'});
  }
}

function getPlace(marker) {
  FB.api(
    "search",
    "GET",
    {
        type: "place",
        center: marker.position.lat()+","+marker.position.lng()
    },
    function (response) {
      if (response && !response.error) {
        generateContent(marker,response);
      }else {
        console.log(response)
      }
    }
  );
}