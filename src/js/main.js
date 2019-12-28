var paywall = require("./lib/paywall");
setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
require("component-leaflet-map");


var cityHTML = document.querySelector(".city");
var selectCity = document.querySelector(".city select");
var selectGender = document.querySelector(".gender select");
var mapElement = document.querySelector("leaflet-map");
var L = mapElement.leaflet;
var map = mapElement.map;

var mapData = require("./test.geo.json");
var pointData = require("../../data/Sheet1.sheet.json");
var cities = [];

for(var x = 0; x<pointData.length; x++){
  pointData[x].geometry = {"type": "Point", "coordinates": [ pointData[x].lat, pointData[x].lng  ]};
  if(cities.indexOf(pointData[x].city) < 0){
    cities.push(pointData[x].city);
  }
}

function makeSelect(label, list){
  var elementHTML = "<option value='' selected disabled hidden>" + label + "</option>"
  for(var x = 0; x < list.length; x++){
    elementHTML += "<option value='"+ list[x] +"'>"+list[x]+"</option>";
  }
  return elementHTML;
}

selectCity.innerHTML = makeSelect("City", cities);

var filters;
function filter(){
  filters = {"City": "", "Gender": ""};
  if(selectCity.value != "City"){
    filters["City"] = (selectCity.value);
  }
  if(selectGender.value != "Gender"){
    filters["Gender"] = (selectGender.value);
  }
  // add age and cause
  addMarks();
}

selectCity.addEventListener("change", filter);
selectGender.addEventListener("change", filter);

map.scrollWheelZoom.disable();
  
function getColor(d) {
  return "pink";
}

function geojsonMarkerOptions(feature) {
  return {
    radius: 7,
    fillColor: getColor(feature.properties),
    color: "#ffffff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.75
  }
};  

var markers = [];
var markergroup = L.featureGroup()

function addMarks(){
  markergroup.clearLayers();
  console.log(filters);
  for( var x = 0; x<pointData.length; x++){
    var marker = null;
    var mark = true;
    if(!(filters.Gender != "" && pointData[x].victim_gender == filters.Gender)){
      console.log(pointData[x].victim_gender);
      mark = false;
    }
    if(!(filters.City != "" && pointData[x].city == filters.City && mark != false)){
      mark = false;
    }
    if(mark){
      marker = L.circleMarker([pointData[x].lat, pointData[x].lng]);
      markers.push(marker);
      marker.addTo(markergroup);
    }
  }
  markergroup.addTo(map);
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
  
  