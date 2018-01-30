//An address object representing a grill in the list
function Address(address, map, marker){
  var self = this;
  self.address = ko.observable(address);
  self.marker = marker;
  //sets the grill's marker to listen for click event
  self.marker.addListener('click', function() {
          self.bouncetoggle(self);
        });
  self.map = map;
  self.infowindow = new google.maps.InfoWindow({
    content: 'Loading...'
  });

  //sets this grill's marker to hidden
  self.removemarker = function(){
    self.infowindow.close(map, self.marker);
    self.marker.setMap(null);
  };

  //set grill's marker to visible
  self.addmarker = function(){
    self.marker.setMap(self.map);
  };

  //funtion to handle actions when a list item or marker is clicked
  self.bouncetoggle = function(address){
    //if a marker is already active, stop animation and close the infowindow
    if (address.marker.getAnimation() !== null) {
          address.marker.setAnimation(null);
          self.infowindow.close(map, address.marker);
        } else {
          //if a marker is not active, deactiate all makers first
          for (var x in MyAppViewModel.addresslist()){
          MyAppViewModel.addresslist()[x].marker.setAnimation(null);
          MyAppViewModel.addresslist()[x].infowindow.close(
            map, MyAppViewModel.addresslist()[x].marker );
          }
          //Turn on animation and open infowindow
          address.marker.setAnimation(google.maps.Animation.BOUNCE);
          self.infowindow.open(map, address.marker);
          //set name of clicked item as sidebar header
          MyAppViewModel.selectlocation(address.address());
          //make Ajax call to the Yelp Search API for the grill clicked
          $.ajax({
            //API url with query including name, lat+lng, etc
            url: "https://api.yelp.com/v3/businesses/search?term=" +
            address.address() + "&latitude=" + address.marker.position.lat() +
            "&longitude=" + address.marker.position.lng(),
            type: "GET",
            headers: {"Authorization" : "Bearer fJmX3reVjBP-1iJgVGuh9-VMWVViG" +
            "3OsqF12q-Tq7Ech2hl-D-jnAucboAzoY7vZXG4-M69ACbVVgg6PLYInXjLj7_zI6" +
            "FyMouzXy7TGEOQNlwbesm0Fjhp3WAZkWnYx"},
            //populate infowindow with API response
            success: function(response) { self.infowindow.setContent(
            "<img src='static/img/yelplogo.png' style='height:50px;'>" +
            "<br>Name: " + response.businesses[0].name + "<br>Rating: " +
            response.businesses[0].rating.toString() + '<br>Price: ' +
            response.businesses[0].price);
            },
            error: function (){
              self.infowindow.setContent('Oops, Yelp isn\'t responding');}
          });

        }
  };
}

function AppViewModel(map, addresslist){
  var self = this;
  //an array to copy addresslist to prevent alias issues
  self.addresslistcopy = [];
  //observable for sidebar header when selection is made
  self.selectlocation = ko.observable("");
  self.addresslist = ko.observableArray(addresslist);
  //observable for user input in filter
  self.searchterms=ko.observable("");

  //Clone addresslist to prevent creating a pointer
  for (var x=0, len = addresslist.length;x<len;x++){
    self.addresslistcopy[x]=addresslist[x];
  }

  //function for user input
  self.updatesearch = function(){

    var filter = self.searchterms();

    //removes all grilles from list before repopulating with filter matches
    self.addresslist.removeAll();

    //loops to check user input and populate addresslist with matches
    for (var x in self.addresslistcopy){
      self.addresslistcopy[x].removemarker();
      if(self.addresslistcopy[x].address().toLowerCase().indexOf(
        filter.toLowerCase()) >= 0) {
        self.addresslist.push(self.addresslistcopy[x]);
        self.addresslistcopy[x].addmarker();
      }
    }

  };
}

//allows the sidebar to hide for mobile
function togglesidebar() {
var sidebar = document.getElementById('sidebar');
var mapbox = document.getElementById('mapbox');
if (mapbox.style.width!=="100%"){
mapbox.style.width="100%";
sidebar.style.display="none";
//resizes map to fit its div after resizing
google.maps.event.trigger(map, 'bounds_changed');
google.maps.event.trigger(map, "resize");
}
else {
  mapbox.style.width="80%";
  sidebar.style.display="block";
  google.maps.event.trigger(map, 'bounds_changed');
  google.maps.event.trigger(map, "resize");
}
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  var addresslist = [];
  var counter = 0;
  //Geocoder for getting lat and longitude from grill name/location
  var geocoder = new google.maps.Geocoder();
  var addresses = ['Winston\'s Grille', 'Watkins', 'Chargrill North',
  'Chuck\'s', 'Big Ed\'s North'];

  for (var x in addresses){
    setupmap(x);
  }

  function setupmap(val){
      geocoder.geocode( { 'address': addresses[val]+', Raleigh'},
      function(results, status) {

        if (status == 'OK') {

          //set initial marker for given grill
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });

          //instantiate new object for each grill
          var address = new Address(addresses[val], map, marker);

          //keep list of grills
          addresslist.push(address);

          //Bind Knockout and set initial map view on last iteration
          if (addresslist.length==addresses.length){
            map.setCenter(results[0].geometry.location);
            map.setZoom(11);
            MyAppViewModel = new AppViewModel(map, addresslist);
            ko.applyBindings(MyAppViewModel);
            MyAppViewModel.searchterms.subscribe(MyAppViewModel.updatesearch);
          }
        } else {
          alert('Error: ' + status);
        }
      });
  }


}
