var paywall = require("./lib/paywall");
setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
require("component-leaflet-map");

var element = document.querySelector("leaflet-map");
var L = element.leaflet;
var map = element.map;


var mapData = require("./test.geo.json");
var pointData = require("../../data/Sheet1.sheet.json");
// "geometry": { "type": "Point", "coordinates": [ 47.5992456, -122.3276425 ] } }
for(var x = 0; x<pointData.length; x++){
  pointData[x].geometry = {"type": "Point", "coordinates": [ pointData[x].lat, pointData[x].lng  ]};
}
console.log(pointData);


var mapElement = document.querySelector("leaflet-map");
console.log(mapElement);

if (mapElement) {
    var L = mapElement.leaflet;
    var map = mapElement.map;
  
    map.scrollWheelZoom.disable();
  
    var onEachFeature = function(feature, layer) {
      var focused = false;
      var popup = false;
  
      layer.on({
          mouseover: function(e) {
              layer.setStyle({ weight: 2.5, fillOpacity: 1 });
          },
          mouseout: function(e) {
              if (focused && focused == layer) { return }
              layer.setStyle({ weight: 1.5, fillOpacity: 0.4});
          }
      });
  };
  
  
    var style = function(feature) {
      var s = {
        fillColor: "white",
        weight: 1,
        opacity: .3,
        color: '#000',
        fillOpacity: 0.45
      };
      return s;
    }
  
    var geojson = L.geoJson(mapData, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  }
  
   map.scrollWheelZoom.disable();


   var acc = document.getElementsByClassName("accordion");
   var i;
   
   for (i = 0; i < acc.length; i++) {
     acc[i].addEventListener("click", function() {
       this.classList.toggle("active");
       var panel = this.nextElementSibling;
       if (panel.style.maxHeight) {
         panel.style.maxHeight = null;
       } else {
         panel.style.maxHeight = panel.scrollHeight + "px";
       }
     });
   }
  
  