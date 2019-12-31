var paywall = require("./lib/paywall");
setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
require("component-leaflet-map");

var pointData = require("../../data/Sheet1.sheet.json");

var selectCity = document.querySelector(".city select");
var selectGender = document.querySelector(".gender select");
var mapElement = document.querySelector("leaflet-map");
var L = mapElement.leaflet;
var map = mapElement.map;
var clearFiltersButton = document.querySelector(".clear-filters");


//make lists to include in drop downs, and sort data for display
var cities = [];
for(var x = 0; x<pointData.length; x++){
  if(pointData[x].date){
    var date = pointData[x].date;
    date.replace("/", "-");
    date = new Date(date);
    pointData[x].sort_date = date;
  }
  if(cities.indexOf(pointData[x].city) < 0){
    cities.push(pointData[x].city);
  }
}

//sort data
pointData = pointData.sort(function (a, b){return b.sort_date - a.sort_date});

//construct HTML for select menu general
function makeSelect(label, list){
  var elementHTML = "<option value='' selected disabled hidden>" + label + "</option>"
  for(var x = 0; x < list.length; x++){
    elementHTML += "<option value='"+ list[x] +"'>"+list[x]+"</option>";
  }
  return elementHTML;
}
//select drop downs
selectCity.innerHTML = makeSelect("City", cities);

map.scrollWheelZoom.disable();

var markers = [];
var markergroup = L.featureGroup();
var marker;

function addAllMarks(){
  markergroup.clearLayers();
  markers = [];
  for(var x = 0; x<pointData.length; x++){
    marker = L.circleMarker([pointData[x].lat, pointData[x].lng], {
      fillColor: getColor(pointData[x]),
      fillOpacity: .4,
      stroke: false,
      index: x
      }).on("click", markerClick);
    markers.push(marker);
    marker.addTo(markergroup);
  }
  markergroup.addTo(map);
}

function addMarks(){
  markergroup.clearLayers();
  markers = [];

  if(filters.Gender == "" && filters.City == ""){
    addAllMarks();
  }
  else{
    for( var x = 0; x<pointData.length; x++){
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
          marker = L.circleMarker([pointData[x].lat, pointData[x].lng], {
            fillColor: getColor(pointData[x]),
            fillOpacity: .4,
            stroke: false,
            index: x
            }).on("click", markerClick);          
          markers.push(marker);
          marker.addTo(markergroup);
        }
      }
    markergroup.addTo(map);
  }
}

function getColor(element){
  if (element.officer_involved && element.officer_involved != ""){
    return  "blue";
  }
  else if(element.new && element.new == "x"){
    return "green";
  }
  else{
    return "black";
  }
}

//define list of filters to be used and apply to markers
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

var selectedHomicide = document.querySelector(".selected-homicide");
var selectedHomicideContainer = document.querySelector(".selected-homicide-container");

function markerClick(){
  console.log(markers);
  var active, activeText;
  for(var x = 0; x < markers.length; x++){
    if (markers[x] == this){
      this.setStyle({fillOpacity: 1});
    }
    else{
      markers[x].setStyle({fillOpacity: .4});
    }
  }
  activeText = "<p class='selected-homicide-text'>" + pointData[this.options.index].date + " | " 
              + pointData[this.options.index].victim_name + " </p>";
  selectedHomicide.innerHTML = activeText;
  selectedHomicideContainer.style = "display:flex";
  this.setStyle({fillOpacity: 1});

}

selectCity.addEventListener("change", filter);
selectGender.addEventListener("change", filter);
window.addEventListener("load", addAllMarks);

clearFiltersButton.addEventListener("click", function(){
  selectedHomicideContainer.style = "display:none";
  selectCity.selectedIndex = 0;
  selectGender.selectedIndex = 0;
  filter();
})

map.scrollWheelZoom.disable();

//Create data table
function makeDataRow(element){
  var rowHTML = "<button class='accordion'> <div class='row-title'> <div>" + element.date + "</div> <div>"
                 + element.time + "</div> <div>"
                 + element.location + "</div> <div>"
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