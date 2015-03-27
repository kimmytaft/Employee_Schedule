'use strict';
// COLORS_RGB holds one color for each name
// Colors are assigned to names in the order each name is first processed
var COLORS_RGB = ['rgb(231, 63, 63)','rgb(231, 231, 75)','rgb(0, 155, 155)','rgb(247, 108, 39)'];

var schedule = new XMLHttpRequest();
var NAMES = [];
var TIMES = [];
//added color array to use json colors
var COLOR = [];

// Adujsts the Luminance of a color
//  Used to darken cell colors for current day and time
//http://www.sitepoint.com/javascript-generate-lighter-darker-color/
function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ('00'+c).substr(c.length);
    }
    return rgb;
}


// Function which converts one channel of rgb to one channel of hex
function hex(x) {
    var hexDigits = new Array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
    return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

// Converts rgb colors to hex colors for passing to ColorLuminance
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}


// Uses TimeToString array to convert a number, stored as an int or string,
//  to the corrisponding word to be used as class names
var TimeToString = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twentyone', 'twentytwo', 'twentythree', 'twentyfour'];
function getTimeName(n){
    if(typeof n == 'string'){
        n = parseInt(n.substring(0,2));
    }
    if(n){
        return TimeToString[n];
    }
    else{
        return '';
    }
}


// Uses DayToString array to convert a number, stored as an int or string,
//  to the corrisponding day name, to be usedwhen setting and referenceing css classes.
// ex: getDayName(1) = 'Monday'
var DayToName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function getDayName(m) {
    if(typeof m == "string"){
        m = parseInt(m);
    }
    if(m){
        return DayToName[m];
    }
    else{
        return "";
    }
}

// Uses getDayName function to convert a day name, stored as an int or string,
//  to the corrisponding day number to be used when setting and referenceing css classes.
function getDayNum(m) {
    if(typeof m == 'number'){
        m = m.toString();
    }
    // var d = DayToName.indexOf(m);
    // if (DayToName[d] == m){
    //     return d;
    // }
    // return 0;

    for (var i = 0; i < DayToName.length; i++) {
        if(getDayName(i) == m){
            return i;
        }
    }
    return 0;
}

// Uses XMLHttpRequest to retrive schedule2.json from local storage
function getSchedule(){
    schedule.open("get", "schedule2.json", false);
    schedule.send(); 
}

//checks to see who is working what day of the week(***MAY NEED WORK)
 
function isWorking(day , schedule, time){
    //create a new array containing the days in the given schedule
   // daysWorking = schedule.map(function (d) {return d.day;});
    //test when the given day is in the list of scheduled days
    for(var i = 0; i < schedule.length; i++){	
    	if(schedule[i].day == getDayName(day/2)){
	console.log(schedule[i].hours);
	   if(validTime(time, schedule[i].hours)){
		console.log("true");
               return true;
	   }
    	}
    }
    return false;
}

//check to see if the time of work is correct to place into the grid (***MAY NEED WORK)
function validTime(time, timeWorking){
    //create a new array containing the times of day worked on the given day
    //creates an array containing arrays of the times of day worked by a given employee
   // timeWorking = schedule.map(function (h) {return h.hours;});
//jsonData[person].schedule[daysOfWeek].hours
    for(var index = 0; index < timeWorking.length; index++){
        if(time >= timeWorking[index].start && time < timeWorking[index].end){
            return true;
        }
    }
    return false;
}

// Reads in schedule2.json and creates a table with that information
function makeTable() {

    // the string to parse as json.
   // var schedule2 = schedule.responceText("schedule2.json");
    var jsonData = JSON.parse(schedule.responseText);
    
    //fill array NAMES with everyones names;
    //fill array COLOR with everyones colors
    for(var n = 0; n < jsonData.length; n++){
        NAMES[n] = jsonData[n].name;
	COLOR[n] = jsonData[n].color;
    }

    //variables needed to create the table
    var table = document.getElementById('table');
    var tableHeading
    var tableRow
    var tableData
    var columns = [ " ", " ", "Monday", " ", "Tuesday", " ",  "Wednesday", " ",  "Thursday", " ",  "Friday"];
    var rows = [" ", " ", "08", "09", "10", "11", "12", "13", "14", "15", "16", " "];
    
    //loops throught the rows array to get all the time slots
    for(var i = 0; i < rows.length; i++){
        tableRow = document.createElement('tr');
        //if i == 0 then the its the firt row which needs the table headings
        if( i == 0){
            tableHeading = document.createElement('th');
            //sets the days of the week as table headings
            for(var j = 0; j < columns.length; j++){
                if(j == 0){
                    tableHeading = tableRow.insertCell(j);
                    tableHeading.innerHTML = columns[j];
                    tableHeading.setAttribute('class', 'time');
                }else if(j % 2 != 0){
                    tableHeading = tableRow.insertCell(j);
                    tableHeading.setAttribute('class', 'divider');
             
                }else{
                    tableHeading = tableRow.insertCell(j); 
                    tableHeading.innerHTML = columns[j];
                    tableHeading.setAttribute('class', 'day');
                    tableHeading.setAttribute("colspan", "4");//colspan needs to change depending on how many people are working on that day.
                    //right now it hard coded to 4, so i could try to fill the grid. 
                    tableRow.appendChild(tableHeading);
                }
                table.appendChild(tableRow);
            }
        //if its one or eleven then its a divider between the days of the week and the key at the bottom
        }else if( i == 1 || i == 11){
            tableData = document.createElement('td');
            tableData = tableRow.insertCell(0);
            tableData.innerHTML = rows[i];
            tableData.setAttribute('class', 'divider2');
            table.appendChild(tableData);
      
        //any other time we need to build the table's rows with the person schedule
        }else{
            tableData = document.createElement('td');
            tableData = tableRow.insertCell(0);
            tableData.innerHTML = rows[i];
            tableData.setAttribute('class', 'time'); 
            //adds time to the first slot of the row
            tableRow.appendChild(tableData);
            var integerTime = parseInt( rows[i], 10);
            var count = 0;
            
            //goes through every day of the week
            for(var daysOfWeek = 0; daysOfWeek < columns.length; daysOfWeek++){
                //makes sure were are only using valid days of the week
                if( columns[daysOfWeek] !== " "){
                    //goes through every person and checks there schedule
                    for(var person = 0; person < jsonData.length; person++){
		
                        //if their schedule contains day and time then it will add color else null
		
                        if(isWorking(daysOfWeek, jsonData[person].schedule, integerTime)){// && validTime(integerTime, jsonData[person].schedule, daysOfWeek)){
                            tableData = tableRow.insertCell(count);
                            tableData.innerHTML = jsonData[person].name;
			    count++;
			   
                        }else{
                            tableData = tableRow.insertCell(count);
                            tableData.innerHTML = null;
                             count++;
                        }
                        tableRow.appendChild(tableData);
                    }
                
                //more for asetics. Adds dividers between the days of the week to keep grid like structure
                }else{
                    tableData = tableRow.insertCell(count);
                  //  tableData.setAttribute('class', 'divider2');
                    tableRow.appendChild(tableData);
                    count++;
                }      
                table.appendChild(tableRow);     
            }
        }
    }
}

// Makes key
    // Employees appear in alphabetical order
function makeKey() {
    var tr;
    var td;
    var div;
    var dividertd;
    var table = document.getElementById('key');


    tr = document.createElement('tr');
    tr.setAttribute('class', '');

    for(var i = 0; i < NAMES.length; i++)
    {        
        td = document.createElement('td');    
        div = document.createElement('div');
        td.setAttribute('class', 'name ' + NAMES[i]);
        div.innerHTML = '<p>' + NAMES[i] + '</p>';
        td.appendChild(div);
        tr.appendChild(td);

        if(i != NAMES.length - 1){
            dividertd = document.createElement('td');
            dividertd.setAttribute('class', 'divider');
            tr.appendChild(dividertd);
        }
    }
        
    table.appendChild(tr);

}

// Darkens cell background color based on class names passed as arguments, i.e. day, time
function darken(day, time) {
    var style;
    var bcolor;
    var nameList = [];
    var classes = '';
    for (var i = 0; i < arguments.length; i++) {
        classes += '.' + arguments[i];
    }

    var element = document.querySelectorAll('.table ' + classes);    

    /* Will only darken color if it is in color set COLORS_RGB */
    /* i.e. Will only darken a cell once */
    for (i = 0; i < element.length; i++) {
        var n = element[i].className.split(' ')[2];
        if(n){
            nameList[nameList.length] = n;
        }
        style = window.getComputedStyle(element[i]);
        bcolor = style.getPropertyValue('background-color');
        if(COLORS_RGB.indexOf(bcolor)>=0)
        {
            element[i].style.backgroundColor = new ColorLuminance(rgb2hex(bcolor), -0.25);
        }
    }
    

    /* Darkens those working in Key */
    for (i = 0; i < nameList.length; i++) {
        classes = '.name.' + nameList[i];
        element = document.querySelectorAll(classes);
        style = window.getComputedStyle(element[0]);
        bcolor = style.getPropertyValue('background-color');
        if(COLORS_RGB.indexOf(bcolor)>=0)
        {
            element[0].style.backgroundColor = new ColorLuminance(rgb2hex(bcolor), -0.25);
        }
    }
    
}

//Sets default cell colors
function setColors() {
    var i, j;
    var classes = '';
    var elements;
    var element;
    var trColors = ['#ffffff', '#848D82'];
    var trBool = 0;

    // Sets alternating dark and light row colors
    for (i = 0; i < TIMES.length; i++) {
        classes = TIMES[i];
        if(classes !== null)
        {
            element = document.getElementById(classes);
            if (element !== null){
                element.style.backgroundColor = trColors[trBool];
                if(trBool === 0)
                    trBool = 1;
                else
                    trBool = 0;
            }
        }
    }

    // Set defalut colors of each employee
        // Colors are assigned in order of their apearence in the COLOR array
        // to employees in alphabetical order

    // Main Table
    for (i = 0; i < NAMES.length; i++) {
        classes = '.' + NAMES[i];
        elements = document.querySelectorAll('.table ' + classes);
        for (j = 0; j < elements.length; j++) {
            elements[j].style.backgroundColor = COLOR[i];
        }
    }

    // Key
    for (i = 0; i < NAMES.length; i++) {
        classes = '.' + NAMES[i];
        elements = document.querySelectorAll('.key ' + classes);
        for (j = 0; j < elements.length; j++) {
            elements[j].style.backgroundColor = COLOR[i];
        }
    }
}

//Calls darken for current date and time
function setByTime() {
    var d = new Date();
    var time = getTimeName(d.getHours());
    var day = getDayName(d.getDay());
    setColors();
    darken(day, time);
}

//Calls creation functions and sets interval
function startTimer(){
    //allows requests to be sent
    getSchedule();
    //reads in the json document and places results into the table
    makeTable();
    makeKey(); 
    setColors();
    setByTime();
    var intervalID = window.setInterval(setByTime, 1000);
}

