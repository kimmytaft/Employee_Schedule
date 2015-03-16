'use strict';
// COLORS_RGB holds one color for each name
// Colors are assigned to names in the order each name is first processed
var COLORS_RGB = ['rgb(231, 63, 63)','rgb(231, 231, 75)','rgb(0, 155, 155)','rgb(247, 108, 39)'];

// var DAY;
// var TIME;
var schedule = new XMLHttpRequest();
var NAMES = [];
var TIMES = [];

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
var DayToName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function getDayName(m) {
    if(typeof m == 'string'){
        m = parseInt(m);
    }
    if(m){
        return DayToName[m];
    }
    else{
        return '';
    }
}

// Uses getDayName function to convert a day name, stored as an int or string,
//  to the corrisponding day number to be used when setting and referenceing css classes.
function getDayNum(m) {
    if(typeof m == 'number'){
        m = m.toString();
    }
    for (var i = 0; i < DayToName.length; i++) {
        if(getDayName(i) == m){
            return i;
        }
    }
    return 0;
}

// Uses XMLHttpRequest to retrive schedule.csv from local storage
function getSchedule(){
    schedule.open('get', 'schedule.csv', false);
    schedule.send();
}

// Reads in schedule.csv and creates a table with appropriate ID's and Classes
function makeTable() {
    var tr;
    var td;
    var dividertd;
    // var i, j;
    var table = document.getElementById('table');
    var time;
    var timeName;

    var tag = 'null';
    var stag = '<' + tag + '>';
    var etag = '<' + tag + '/>';


    // Split schedule csv on rows to 1-D array
    var csv = schedule.responseText.split('\n');

    // Split csv array on columns to 2-D array
    for(var f = 0; f<csv.length; f++){
        if(csv[f][0] === undefined)
        {
            csv.splice(f,1);
        }
        else
        {
            csv[f] = csv[f].split(',');
        }
    }

    // Gets size for each day and fills in missing day names if necessary
    var days = [0,0,0,0,0,0];
    var lastDay = '';
    for(var c = 0; c < csv[0].length; c++){
        if(csv[0][c]){
            lastDay = csv[0][c];
        }
        else{
            csv[0][c] = lastDay;
        }
        days[getDayNum(lastDay)]++;
    }
    
    var divider = 0;
    var dayCount = 1;

    for(var i = 0; i < csv.length; i++)
    {
        tr = document.createElement('tr');
        time = parseInt(csv[i][0].substring(0,2));
        timeName = getTimeName(time);
        TIMES[time] = timeName;
        tr.setAttribute('class', timeName);
        tr.setAttribute('id', timeName);
        for(var j = 0; j < csv[0].length; j++)
        {
            td = document.createElement('td');
        
            if(getTimeName(csv[i][j]) !== ''){
                td.setAttribute('class', 'time');
                td.innerHTML = csv[i][j].substring(0,2);
            }
            else if(getDayNum(csv[i][j]) !== 0){
                td.innerHTML = stag + csv[i][j] + etag;
                td.setAttribute('class', 'day');
                td.setAttribute('colSpan', days[getDayNum(csv[i][j])]);
                j+=days[getDayNum(csv[i][j])]-1;
            }
            else if(csv[i][j] !== ''){
                if(NAMES.indexOf(csv[i][j])<0){
                    // NAMES[NAMES.length] = csv[i][j];
                    NAMES.push(csv[i][j]);
                }
                td.setAttribute('class', csv[0][j] + ' ' + getTimeName(csv[i][0]) + ' ' + csv[i][j]);
            }
            else{
                td.setAttribute('class', csv[0][j] + ' ' + getTimeName(csv[i][0]));
            }

            tr.appendChild(td);

            if(j < csv[0].length-1 & j==divider){
                dividertd = document.createElement('td');
                dividertd.setAttribute('class', 'divider');
                tr.appendChild(dividertd);
                divider+=days[dayCount];
                dayCount++;
            } 
                       
        }
        table.appendChild(tr);

        if((i===0)|(i==csv.length-1)){
           var linetr = document.createElement('tr');
           linetr.setAttribute('class', 'line');
           var linetd = document.createElement('td');
           linetd.setAttribute('colSpan', csv[0].length+5);
           linetr.appendChild(linetd);
           table.appendChild(linetr);
        }

        divider = 0;
        dayCount = 1;
    }

    // Alphabatize names array for later use
    NAMES.sort();
}

// Makes key
    // Employees apeare in alphabetical order
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
            element.style.backgroundColor = trColors[trBool];
            if(trBool === 0)
                trBool = 1;
            else
                trBool = 0;
        }
    }

    // Set defalut colors of each employee
        // Colors are assigned in order of their apearence in the COLORS array
        // to employees in alphabetical order

    // Main Table
    for (i = 0; i < NAMES.length; i++) {
        classes = '.' + NAMES[i];
        elements = document.querySelectorAll('.table ' + classes);
        for (j = 0; j < elements.length; j++) {
            elements[j].style.backgroundColor = COLORS_RGB[i];
        }
    }

    // Key
    for (i = 0; i < NAMES.length; i++) {
        classes = '.' + NAMES[i];
        elements = document.querySelectorAll('.key ' + classes);
        for (j = 0; j < elements.length; j++) {
            elements[j].style.backgroundColor = COLORS_RGB[i];
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
    // if((day!=DAY)|(time!=TIME))
    // {
    //     DAY = day;
    //     TIME = time;
    //     setColors();
    //     darken(day, time);
    // }
}

//Calls creation functions and sets interval
function startTimer(){
    getSchedule();
    makeTable();
    makeKey(); 
    setColors();
    setByTime();
    var intervalID = window.setInterval(setByTime, 1000);
}

