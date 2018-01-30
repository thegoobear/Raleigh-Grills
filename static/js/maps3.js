function Address(address, map, marker){
  var self = this;
  self.address = ko.observable(address);
  self.marker = marker;
  self.map = map;
  self.infowindow = new google.maps.InfoWindow({
    content: 'Loading...'
  });

  self.removemarker = function(){
    self.marker.setMap(null);
  }

  self.addmarker = function(){
    self.marker.setMap(self.map);
  }

  self.bouncetoggle = function(address){
    if (address.marker.getAnimation() !== null) {
          address.marker.setAnimation(null);
          self.infowindow.close(map, address.marker);
        } else {
          for (x in MyAppViewModel.addresslist()){
          MyAppViewModel.addresslist()[x].marker.setAnimation(null);
          MyAppViewModel.addresslist()[x].infowindow.close(
            map, MyAppViewModel.addresslist()[x].marker )
          }
          address.marker.setAnimation(google.maps.Animation.BOUNCE);
          self.infowindow.open(map, address.marker);
          MyAppViewModel.selectlocation(address.address());

          $.ajax({
            url: "https://api.yelp.com/v3/businesses/search?term="
            + address.address() + "&latitude=" + address.marker.position.lat()
            + "&longitude=" + address.marker.position.lng(),
            type: "GET",
            headers: {"Authorization" : "Bearer fJmX3reVjBP-1iJgVGuh9-VMWVViG3O"
            + "sqF12q-Tq7Ech2hl-D-jnAucboAzoY7vZXG4-M69ACbVVgg6PLYInXjLj7_zI6Fy"
            + "MouzXy7TGEOQNlwbesm0Fjhp3WAZkWnYx"},
            success: function(response) { self.infowindow.setContent(
            "<img src='static/img/yelplogo.png' style='height:50px;'><br>Name: "
            + response.businesses[0].name + "<br>Rating: "
            + response.businesses[0].rating.toString() + '<br>Price: '
            + response.businesses[0].price);
            },
            error: function (){
              self.infowindow.setContent('Oops, Yelp isn\'t responding')}
          });

        }
  }
}

function AppViewModel(map, addresslist){
  var self = this;
  self.addresslistcopy = [];
  self.selectlocation = ko.observable("");
  self.addresslist = ko.observableArray(addresslist);
  self.searchterms=ko.observable("");

  for (var x=0, len = addresslist.length;x<len;x++){
    self.addresslistcopy[x]=addresslist[x];
  }

  self.updatesearch = function(){

    var filter = self.searchterms();
    self.addresslist.removeAll();

    for (var x in self.addresslistcopy){
      self.addresslistcopy[x].removemarker();
      //console.log(addresslist[x].address)
      if(self.addresslistcopy[x].address().toLowerCase().indexOf(
        filter.toLowerCase()) >= 0) {
        self.addresslist.push(self.addresslistcopy[x]);
        self.addresslistcopy[x].addmarker();
      }
    }

  };
}

function togglesidebar() {
var sidebar = document.getElementById('sidebar');
var mapbox = document.getElementById('mapbox');
if (mapbox.style.width!=="100%"){
mapbox.style.width="100%";
sidebar.style.display="none";
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
  var topbar = document.getElementById('sidebar');
  //var markers = [];
  var addresslist = [];
  var counter = 0;
  var geocoder = new google.maps.Geocoder();
  var addresses = ['Winston\'s Grille', 'Watkins', 'Chargrill North',
  'Chuck\'s', 'Big Ed\'s North'];

  for (x in addresses){
    setupmap(x);
    //console.log(addresslist);
  }

  function setupmap(val){
      geocoder.geocode( { 'address': addresses[val]+', Raleigh'},
      function(results, status) {

        if (status == 'OK') {

          map.setCenter(results[0].geometry.location);
          map.setZoom(11);

          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });

          console.log(results[0].geometry.location.lat());

          var address = new Address(addresses[val], map, marker);

          addresslist.push(address);
          if (addresslist.length==addresses.length){
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
