/*
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  // append the <p id="actions"> tag with the text "Toggle Dark Mode"
  const actions = document.getElementById('actions')
  actions.innerHTML += '<br>Toggle Dark Mode ' + (isDarkMode ? 'Dark' : 'Light')
})
  
document.getElementById('reset-to-system').addEventListener('click', async () => {
  await window.darkMode.system()
  document.getElementById('theme-source').innerHTML = 'System'
  // append the <p id="actions"> tag with the text "Reset to System"
  const actions = document.getElementById('actions')
  const hello = await window.helloWorld.helloWorld('System ')
  actions.innerHTML += '<br>Reset to System ' + hello
})
*/

document.getElementById('load-salesData').addEventListener('click', async () => {

  // Your code here
  var data = await window.maps.getData()
  //console.log(data)
  /*
    Example of data in CSV file:
    Latitude,Longitude,Library,SaleDetails
    42.3315509,-83.0466403,Festival of Books!,July 21
  */

  // convert the csv string into a JSON object
  data = d3.csvParse(data);

  // filter out duplicate rows
  data = data.filter((v,i,a)=>a.findIndex(t=>(t.Latitude === v.Latitude && t.Longitude===v.Longitude))===i)

  // filter out rows with missing lat or lon
  data = data.filter((v,i,a)=>v.Latitude !== "" && v.Longitude !== "")

  // find the average lon and lat
  var latSum = 0.0;
  var lonSum = 0.0;
  for (row in data) {
    row = data[row]
    if (parseFloat(row.Latitude) == NaN || parseFloat(row.Longitude) == NaN) {
      console.log(row.Latitude, row.Longitude)
      continue;
    }
    else if (latSum == NaN || lonSum == NaN) {
      console.log(latSum, lonSum)
      break;
    }
    
    latSum += parseFloat(row.Latitude)
    lonSum += parseFloat(row.Longitude)
  }
  var latAvg = latSum / data.length;
  var lonAvg = lonSum / data.length;

  console.log(latAvg, lonAvg)

  var map = L.map('map').setView([latAvg, lonAvg], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
  }).addTo(map);

  // Loop through the data
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var lat = row.Latitude;
    var lon = row.Longitude;
    var name = row.Library;
    var details = row.SaleDetails;

    //console.log(row)

    /*if (lat == "" || lat == null || lat == undefined) {
      continue;
    }

    if (lon == "" || lon == null || lon == undefined) {
      continue;
    }*/

    L.marker([lat, lon]).addTo(map).bindPopup("<b>" + name + "</b><br>" + details);
  }


  var marker = L.marker([51.5, -0.09]).addTo(map);

  marker.bindPopup("<b>Hello world!</b><br>I am a popup.");


})