var paywall = require("./lib/paywall");
setTimeout(() => paywall(12345678), 5000);

require("component-responsive-frame/child");
require("component-leaflet-map");

var pointData = require("../../data/Sheet1.sheet.json");

//DOM elements
var selectCity = document.querySelector(".city select");
var selectCause = document.querySelector(".cause select");
var selectAge = document.querySelector(".age select");
var mapElement = document.querySelector("leaflet-map");
var clearFiltersButton = document.querySelector(".clear-filters");
var clearSelection = document.querySelector(".clear-search");
var clickToSee = document.querySelector(".more-rows");
var selectedHomicide = document.querySelector(".selected-homicide");
var selectedHomicideContainer = document.querySelector(".selected-homicide-container");

//global vars
var L = mapElement.leaflet;
var map = mapElement.map;
var cities = [];
var markers = [];
var markergroup = L.featureGroup();
var marker;
var filters;



//make lists to include in drop downs, and sort data for display
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

//construct HTML for city select
function makeCity(label, list){
  var elementHTML = "<option value='' selected disabled hidden>" + label + "</option>"
  for(var x = 0; x < list.length; x++){
    elementHTML += "<option value='"+ list[x] +"'>"+list[x]+"</option>";
  }
  return elementHTML;
}
selectCity.innerHTML = makeCity("City", cities);

map.scrollWheelZoom.disable();

function addAllMarks(){
  markergroup.clearLayers();
  markers = [];
  for(var x = 0; x<pointData.length; x++){
    marker = L.circleMarker([pointData[x].lat, pointData[x].lng], {
      fillColor: getColor(pointData[x]),
      fillOpacity: .4,
      index: x,
      weight: 1.5,
      color: getColor(pointData[x])
      }).on("click", markerClick);
    markers.push(marker);
    marker.addTo(markergroup);
  }
  markergroup.addTo(map);
}

function addMarks(){
  markergroup.clearLayers();
  markers = [];

  if(filters.Cause == "" && filters.City == "" && filters.Age){
    addAllMarks();
  }
  else{
    for( var x = 0; x<pointData.length; x++){
        var mark = true;
        if(filters.Cause != ""){
          if(pointData[x].cause_death != filters.Cause){
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
            index: x,
            weight: 1.5,
            color: getColor(pointData[x])
            }).on("click", markerClick);          
          markers.push(marker);
          marker.addTo(markergroup);
        }
      }
    markergroup.addTo(map);
  }
}

function getColor(element){
  if(element.new && element.new == "x"){
    return "lime";
  }
  else if (element.police_shooting && element.police_shooting != ""){
    return  "darkorange";
  }
  else{
    return "darkolivegreen";
  }
}

//define list of filters to be used and apply to markers
function filter(){
  filters = {"City": "", "Cause": "", "Age": ""};
  if(selectCity.value != "City"){
    filters["City"] = (selectCity.value);
  }
  if(selectCause.value != "Cause"){
    filters["Cause"] = (selectCause.value);
  }
  if(selectAge.value != "Age"){
    filters["Age"] = (selectAge.value);
  }
  addMarks();
}

function markerClick(){
  console.log(markers);
  var activeText;
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
  var selectedRow = makeDataRow(pointData[this.options.index]);
  dataTable.innerHTML = selectedRow;
  var selectedPanel = document.querySelector(".panel");
  selectedPanel.style = "max-height:" + (document.querySelector(".panel p").scrollHeight + 50) + "px";
  clickToSee.style.display = "none";
}

function clear(){
  clickToSee.style.display = "block";
  dataTable.innerHTML = makeDataTable();
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
  selectedHomicideContainer.style = "display:none";
  selectCity.selectedIndex = 0;
  selectCause.selectedIndex = 0;
  filter();
}

map.scrollWheelZoom.disable();

//Create data table
function makeDataRow(element){
  var rowHTML = "<button class='accordion'> <div class='row-title'> <div class='row-date'>" + element.date + "</div> <div>" 
                + element.victim_name + ", " + element.victim_age + "</div> "
                + "<div>" + element.city + "</div>"
                + "<div>" + element.url_date + "</div> </div></button>" 
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

selectCity.addEventListener("change", filter);
selectCause.addEventListener("change", filter);
selectAge.addEventListener("change", filter);
window.addEventListener("load", addAllMarks);
clearFiltersButton.addEventListener("click", clear);
clearSelection.addEventListener("click", clear);

