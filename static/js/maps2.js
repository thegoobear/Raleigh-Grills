function Address(address, map, marker){
  var self = this;
  self.address = ko.observable(address);
  self.marker = marker;
  self.map = map;

  self.removemarker = function(){
    self.marker.setMap(null);
  }

  self.addmarker = function(){
    self.marker.setMap(self.map);
  }

  self.bouncetoggle = function(address){
    if (address.marker.getAnimation() !== null) {
          address.marker.setAnimation(null);
        } else {
          //MyAppViewModel.addresslist()[0].setAnimation(null);
          address.marker.setAnimation(google.maps.Animation.BOUNCE);
        }
  }
}

function AppViewModel(map, addresslist){
  var self = this;
  self.addresslist = ko.observableArray(addresslist);
  self.searchterms=ko.observable("");


  self.updatesearch = function(){

    var filter = self.searchterms();
    self.addresslist.removeAll();

  //  for (i in markers){
  //    markers[i].setMap(null);
    //}

    for (var x in addresslist){
      addresslist[x].removemarker();
      //console.log(addresslist[x].address)
      if(addresslist[x].address().toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
        self.addresslist.push(addresslist[x]);
        addresslist[x].addmarker();
      }
    }

  };

  self.selectlocation = function(address){

    address

  };
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  //var markers = [];
  var addresslist = [];
  var counter = 0;
  var geocoder = new google.maps.Geocoder();
  var addresses = ['Winston\'s Grille', 'Watkins', 'Chargrill North', 'Chuck\'s', 'Big Ed\'s North'];

  for (x in addresses){
    setupmap(x);
  }

  function setupmap(val){
      geocoder.geocode( { 'address': addresses[val]+', Raleigh'}, setmarker);
  }

  function setmarker(results, status){
    if (status == 'OK') {

      map.setCenter(results[0].geometry.location);
      map.setZoom(11);

      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });

      var address = new Address(addresses[val], map, marker);

      //markers.push(marker);
      addresslist.push(address);

    } else {
      alert('Error: ' + status);
    }
  }

  MyAppViewModel = new AppViewModel(map, addresslist);
  ko.applyBindings(MyAppViewModel);
  MyAppViewModel.searchterms.subscribe(MyAppViewModel.updatesearch);

}
