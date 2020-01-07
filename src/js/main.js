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
var moreRows = document.querySelector(".more-rows");

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

var dataTableGroup;

function addAllMarks(){
  dataTableGroup = [];
  markergroup.clearLayers();
  markers = [];
  for(var x = 0; x<pointData.length; x++){
    marker = makeMark(pointData[x], x);
    markers.push(marker);
    marker.addTo(markergroup);
    dataTableGroup.push(x);
  }
  markergroup.addTo(map);
}

function addMarks(){
  dataTableGroup = [];
  markergroup.clearLayers();
  markers = [];

  if(filters.Cause == "" && filters.City == "" && filters.Age == ""){
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
        if(filters.Age != "" && mark != false){
          console.log("Hi");
          if((filters.Age).length > 1){
            if(pointData[x].victim_age < filters.Age[0] || pointData[x].victim_age > filters.Age[1]){
              mark = false;
            }
          }
          else{
            if(pointData[x].victim_age < filters.Age[0]){
              mark = false;
            }
          }
        }
        if(mark){
          marker = makeMark(pointData[x], x);         
          markers.push(marker);
          marker.addTo(markergroup);
          dataTableGroup.push(x);
        }
      }
    markergroup.addTo(map);
  }
}

function makeMark(data, x){
  return L.circleMarker([data.lat, data.lng], {
    fillColor: getColor(data),
    fillOpacity: .4,
    index: x,
    weight: 1.5,
    color: getColor(data)
    }).on("click", markerClick); 
}

function getColor(element){
  if(element.new && element.new == "x"){
    return "#94F28C";
  }
  else if (element.police_shooting && element.police_shooting != ""){
    return  "darkorange";
  }
  else{
    return " #1D6D39";
  }
}

function filter(){
  filters = {"City": "", "Cause": "", "Age": ""};
  if(selectCity.value != "City"){
    filters["City"] = (selectCity.value);
  }
  if(selectCause.value != "Cause"){
    filters["Cause"] = (selectCause.value);
  }
  if(selectAge.value != "Age"){
    var age = (selectAge.value);
    age = age.split(",");
    for(var x = 0; x<age.length; x++){age[x] = parseInt(age[x])};
    filters["Age"] = age;
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
  activeText = "<p class='selected-homicide-text'>" + pointData[this.options.index].date + " - " 
              + pointData[this.options.index].victim_name + " </p>";
  selectedHomicide.innerHTML = activeText;
  selectedHomicideContainer.style.cssText = "display:flex";
  this.setStyle({fillOpacity: 1});
  var selectedRow = makeDataRow(pointData[this.options.index]);
  dataTable.innerHTML = selectedRow;
  var selectedPanel = document.querySelector(".panel");
  selectedPanel.style.cssText = "max-height:" + (document.querySelector(".panel p").scrollHeight + 50) + "px";
  clickToSee.style.display = "none";
}

function clear(){
  clickToSee.style.display = "block";
  dataTable.innerHTML = makeDataTable(currentRows);
  if(currentRows >= pointData.length){moreRows.style.display = "none";}
  makeAccordion();
  selectedHomicideContainer.style.cssText = "display:none";
  selectCity.selectedIndex = 0;
  selectCause.selectedIndex = 0;
  selectAge.selectedIndex = 0;
  filter();
}

map.scrollWheelZoom.disable();

//Create data table
function makeDataRow(element){
  var rowHTML = "<button class='accordion'> <div class='row-title'> <div class='row-date'>" + element.date + "</div> <div class='row-name'>" 
                + element.victim_name + ", " + element.victim_age ;
  if(element.victim2_name){
    rowHTML += " <br>" + element.victim2_name + ", " + element.victim2_age + "</div> ";
  } else{
    rowHTML += "</div> "
  }
  rowHTML += "<div class='row-city'>" + element.city + "</div>"
            + "<div class='row-latest'><a href='" + element.url + "' class='data-table-link' target='_blank' rel='noopener noreferrer'>" + element.url_date + "</a></div> </div></button>";

  var panel = "<div class='panel'> <p>" + element.description + "</p>";
  panel += "<p>Cause of death: " + element.cause_death_description + "</p>";
  if(element.suspect_name){
    panel += "<p>Suspect: " + element.suspect_name;
    if(element.convicted){
      panel += ", <span class='convicted'>convicted</span>";
    }
    else{
      panel += ", not convicted";
    }
    panel += "</p>";
  }
  if(element.updates){
    panel += "<p>Updates: " + element.updates + "</p>";
  }
  
  var urlText = "";
  if(element.url && element.url_date != ""){ urlText += makeURL(element.url, element.url_date)  }
  if(element.url2 && element.url2_date != ""){ urlText += ", " + makeURL(element.url2, element.url2_date)  }
  if(element.url3 && element.url3_date != ""){ urlText += ", " + makeURL(element.url3, element.url3_date)  }
  if(element.url4 && element.url4_date != "" ){ urlText += ", " + makeURL(element.url4, element.url4_date)  }

  if(urlText != ""){panel += "<p> Read More: " + urlText + "</p>"}
  
  panel += "</div>";
  rowHTML += panel;
  return rowHTML;
}

function makeURL(url, urldate ){
  return "<a href='" + url + "' class='data-table-link' target='_blank' rel='noopener noreferrer'>" + urldate + "</a>"
}

function makeDataTable(rows){
  var dataTableHTML = "";
  for(var x = 0; x < rows; x++){
    dataTableHTML += makeDataRow(pointData[x]);
  }
  return dataTableHTML;
}

var dataTable = document.querySelector(".data-table");
var currentRows;
if(pointData.length <15){
  currentRows = pointData.length;
  moreRows.style.display = "none";
}
else{
  currentRows = 15;
}
dataTable.innerHTML = makeDataTable(currentRows);
makeAccordion();

function makeAccordion(){
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
}

moreRows.addEventListener("click", function(){
  if(currentRows < pointData.length){
    if((pointData.length - currentRows) < 15){
      currentRows = pointData.length;
    }else{
      currentRows += 15;
    }
    dataTable.innerHTML = makeDataTable(currentRows);
    if(currentRows == pointData.length){
      moreRows.style.display = "none";
    }
  }
  else{
    moreRows.style.display = "none";
  }
  makeAccordion();
});
selectCity.addEventListener("change", filter);
selectCause.addEventListener("change", filter);
selectAge.addEventListener("change", filter);
window.addEventListener("load", addAllMarks);
clearFiltersButton.addEventListener("click", clear);
clearSelection.addEventListener("click", clear);

