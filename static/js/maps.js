//function Address(address){
//  var self = this;
//  self.address = ko.observable(address);
//}

function AppViewModel(map, geocoder, addresses, markers){

  var self = this;
  self.addresslist = ko.observableArray([]);

  for (var x in addresses){
  //address = new Address(addresses[x]);
  self.addresslist.push(addresses[x]);
  }

  self.searchterms=ko.observable("");

  self.updatesearch = function(){
    var filter = self.searchterms();

    self.addresslist.removeAll();

    for (i in markers){
      markers[i].setMap(null);
    }

    for (var x in addresses){
      if(addresses[x].toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
        self.addresslist.push(addresses[x]);
        markers[x].setMap(map);
      }
    }

  };
}

function initMap() {

  var map = new google.maps.Map(document.getElementById('map'));
  var markers = [];
  var geocoder = new google.maps.Geocoder();
  var addresses = ['Winston\'s Grille', 'Watkins', 'Chargrill North', 'Chuck\'s', 'Big Ed\'s North'];

  for (x in addresses){
  geocoder.geocode( { 'address': addresses[x]+', Raleigh'}, function(results, status) {

    if (status == 'OK') {

      map.setCenter(results[0].geometry.location);
      map.setZoom(11);

      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });

      markers.push(marker);

    } else {
      alert('Error: ' + status);
    }
  });
  }

  MyAppViewModel = new AppViewModel(map, geocoder, addresses, markers);
  ko.applyBindings(MyAppViewModel);
  MyAppViewModel.searchterms.subscribe(MyAppViewModel.updatesearch);

}
