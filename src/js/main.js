var paywall = require("./lib/paywall");
setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
require("component-leaflet-map");


var cityHTML = document.querySelector(".city");
var selectCity = document.querySelector(".city select");
var selectGender = document.querySelector(".gender select");
var mapElement = document.querySelector("leaflet-map");
var clearFiltersButton = document.querySelector(".clear-filters");
var L = mapElement.leaflet;
var map = mapElement.map;

var mapData = require("./test.geo.json");
var pointData = require("../../data/Sheet1.sheet.json");

//make list of cities to include on drop down use this for all other select menus
var cities = [];
for(var x = 0; x<pointData.length; x++){
  pointData[x].geometry = {"type": "Point", "coordinates": [ pointData[x].lat, pointData[x].lng  ]};
  if(cities.indexOf(pointData[x].city) < 0){
    cities.push(pointData[x].city);
  }
}

//construct HTML for select menu general
function makeSelect(label, list){
  var elementHTML = "<option value='' selected disabled hidden>" + label + "</option>"
  for(var x = 0; x < list.length; x++){
    elementHTML += "<option value='"+ list[x] +"'>"+list[x]+"</option>";
  }
  return elementHTML;
}

selectCity.innerHTML = makeSelect("City", cities);

//define list of filters to be used
var filters;
function filter(){
  console.log("Checking filters");
  filters = {"City": "", "Gender": ""};
  if(selectCity.value != "City"){
    filters["City"] = (selectCity.value);
  }
  if(selectGender.value != "Gender"){
    filters["Gender"] = (selectGender.value);
  }
  // add age and cause
  console.log("filters: City: " + filters.City + " Gender: " + filters.Gender);
  addMarks();
}

map.scrollWheelZoom.disable();
  
//edit this to determine if new, officer involved, or other
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
}  

var markers = [];
var markergroup = L.featureGroup();
var marker;


function addMarks(){
  markergroup.clearLayers();

  if(filters.Gender == "" && filters.City == ""){
    addAllMarks();
  }
  else{
    for( var x = 0; x<pointData.length; x++){
        marker = null;
        var mark = true;
        if(filters.Gender != ""){
          if(pointData[x].victim_gender != filters.Gender){
            mark = false;
          }
        }
        if(filters.City != "" && mark != false){
          if(pointData[x].city != filters.City){
            mark = false;
          }
        }
        if(mark){
          marker = L.circleMarker([pointData[x].lat, pointData[x].lng]);
          markers.push(marker);
          marker.addTo(markergroup);
        }
      }
    markergroup.addTo(map);
  }
}

function addAllMarks(){
  markergroup.clearLayers();
  for(var x = 0; x<pointData.length; x++){
    marker = L.circleMarker([pointData[x].lat, pointData[x].lng]);
    markers.push(marker);
    marker.addTo(markergroup);
  }
  markergroup.addTo(map);
}

selectCity.addEventListener("change", filter);
selectGender.addEventListener("change", filter);
window.addEventListener("load", addAllMarks);
clearFiltersButton.addEventListener("click", function(){
  selectCity.selectedIndex = 0;
  selectGender.selectedIndex = 0;
  filter();
})

map.scrollWheelZoom.disable();


//Create data table
function makeDataRow(element){
  var rowHTML = "<button class='accordion'> <div class='row-title'> <div>" + element.date + "</div> <div>"
                 + element.time + "</div> <div>"
                 + element.city + "</div> <div>"
                 + element.victim_name + ", " + element.victim_age + "</div> </div> </button>"
                 + "<div class='panel'> <p>" + element.description + "</p> </div>";
  return rowHTML;
}

function makeDataTable(){
  var dataTableHTML = "";
  for(var x = 0; x < pointData.length; x++){
    dataTableHTML += makeDataRow(pointData[x]);
  }
  return dataTableHTML;
}

var dataTable = document.querySelector(".data-table");
dataTable.innerHTML = makeDataTable();

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