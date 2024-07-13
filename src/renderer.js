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

const mde = new EasyMDE({element: document.getElementById('saleDetails')});

// if a state is selected, enable the "Load Sales Data" and the "upload HTML" button
document.getElementById('state').addEventListener('change', () => {
  var state = document.getElementById('state').value;
  if (state != "") {
    document.getElementById('load-salesData').disabled = false;
    document.getElementById('upload-html').disabled = false;
    document.getElementById('grab-index').disabled = false;
    document.getElementById('add-sale').disabled = false;
  }
  else {
    document.getElementById('load-salesData').disabled = true;
    document.getElementById('upload-html').disabled = true;
    document.getElementById('grab-index').disabled = true;
    document.getElementById('add-sale').disabled = true;
  }
})

async function loadSalesData() {
  // find the state selected
  var state = document.getElementById('state').value;

  // if there's no state selected, return
  if (state == "") {
    return;
  }

  var search = document.getElementById('search').value

  // delete the map if it exists to stop "Map container is already initialized"

  // track where the map is to create a new one later
  var map = document.getElementById('map')
  if (map != null) {
    map.remove()
  }

  // create a new map using: <div id="map" style="flex: 1; height: 96vh;"></div> in index.html, and add it inside the first div
  var newMap = document.createElement('div')
  newMap.id = 'map'
  newMap.style.flex = '1'
  newMap.style.height = '96vh'
  document.getElementById('split').appendChild(newMap)
  
  var data = await window.maps.getData(state)
  // convert the csv string into a JSON object
  data = d3.csvParse(data);


  var userData

  try {
    userData = await window.maps.getUserData(state)
    userData = d3.csvParse(userData);
    userData = userData.filter((v,i,a)=>v.Latitude !== "" && v.Longitude !== "")
  }
  catch (error) {
    //console.error('Error getting user data:', error)
    // user data not found
    userData = []
  }
  //console.log(data)
  /*
    Example of data in CSV file:
    Latitude,Longitude,Library,SaleDetails
    42.3315509,-83.0466403,Festival of Books!,July 21
  */


  // filter out duplicate rows
  data = data.filter((v,i,a)=>a.findIndex(t=>(t.Latitude === v.Latitude && t.Longitude===v.Longitude))===i)

  // filter out rows with missing lat or lon
  data = data.filter((v,i,a)=>v.Latitude !== "" && v.Longitude !== "")

  // filter out rows that don't contain the search term, if the search term exists
  if (search != "") {
    data = data.filter((v,i,a)=>v.Library.toLowerCase().includes(search.toLowerCase()) || v.SaleDetails.toLowerCase().includes(search.toLowerCase()))
    userData = userData.filter((v,i,a)=>v.Library.toLowerCase().includes(search.toLowerCase()) || v.SaleDetails.toLowerCase().includes(search.toLowerCase()))
  }

  // find the average lon and lat
  var latSum = 0.0;
  var lonSum = 0.0;
  for (row in data) {
    row = data[row]
    if (parseFloat(row.Latitude) == NaN || parseFloat(row.Longitude) == NaN) {
      console.error("one or more is NaN: " + row.Latitude, row.Longitude)
      continue;
    }
    else if (latSum == NaN || lonSum == NaN) {
      console.error(latSum, lonSum)
      break;
    }
    
    latSum += parseFloat(row.Latitude)
    lonSum += parseFloat(row.Longitude)
  }
  var latAvg = latSum / data.length;
  var lonAvg = lonSum / data.length;

  //console.log(latAvg, lonAvg)

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
    var customIcon;

    // if the row is a major sale, make the marker yellow, else keep it blue
    if (row.MajorSale === 'true') {
      customIcon = L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }
    else {
      customIcon = L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }

    // set the marker
    L.marker([lat, lon], {icon: customIcon}).addTo(map).bindPopup("<b>" + name + "</b><br>" + details);
  }

  // Loop through the user data
  for (var i = 0; i < userData.length; i++) {
    var row = userData[i];
    var lat = row.Latitude;
    var lon = row.Longitude;
    var name = row.Library;
    var details = row.SaleDetails;

    // convert the markdown sales details into HTML
    details = mde.options.previewRender(details, mde)

    //console.log(row)

    // make the marker green
    var customIcon = L.icon({
      iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.marker([lat, lon], {icon: customIcon}).addTo(map).bindPopup("<b>" + name + "</b><br>" + details);

  }

  // Add the date added to the right of the "Load Sales Data" button

  var dateAdded = await window.maps.getDateAdded(state)
    if (dateAdded === false) {
      document.getElementById('date-added').innerHTML = "Date of file: Not found"
      return
    }

    document.getElementById('date-added').innerHTML = "Date of file: " + dateAdded

}

document.getElementById('load-salesData').addEventListener('click', loadSalesData);

document.getElementById('search').addEventListener('keydown', async (event) => {
  if (event.key === "Enter") {
    loadSalesData()
  }
})

document.getElementById('upload-html').addEventListener('click', async () => {
  var state = document.getElementById('state').value;

  var filePath = await window.maps.getFilePath()

  if (filePath === false) {
    return
  }

  var success = await window.maps.uploadHTML(filePath, state)

  if (success) {
    loadSalesData()
    var dateAdded = await window.maps.getDateAdded(state)
    if (dateAdded === false) {
      document.getElementById('date-added').innerHTML = "Date of file: Not found"
      return
    }

    document.getElementById('date-added').innerHTML = "Date of file: " + dateAdded
  }

})

document.getElementById('grab-index').addEventListener('click', async () => {

  var state = document.getElementById('state').value;
  var index = document.getElementById('index').value;

  var sale = await window.maps.grabSale(state, index)

  if (sale === false) {
    // clear the input fields
    document.getElementById('city').value = ""
    document.getElementById('libraryName').value = ""
    mde.value("")
    document.getElementById('lat').value = ""
    document.getElementById('lon').value = ""

    return
  }

  //console.log(sale)

  // set the input fields to the grabbed sale
  document.getElementById('city').value = ""
  document.getElementById('libraryName').value = sale.Library
  mde.value(sale.SaleDetails)
  document.getElementById('lat').value = sale.Latitude
  document.getElementById('lon').value = sale.Longitude
})

document.getElementById('add-sale').addEventListener('click', async () => {
  var city = document.getElementById('city').value
  var state = document.getElementById('state').value
  var libraryName = document.getElementById('libraryName').value
  var saleDetails = mde.value()
  var lat = document.getElementById('lat').value
  var lon = document.getElementById('lon').value
  var index = document.getElementById('index').value

  var success = await window.maps.addSale(city, state, libraryName, saleDetails, lat, lon, index)

  if (success) {
    loadSalesData()

    // clear the input fields
    document.getElementById('city').value = ""
    document.getElementById('libraryName').value = ""
    mde.value("")
    document.getElementById('lat').value = ""
    document.getElementById('lon').value = ""
    document.getElementById('index').value = ""
  }
})

const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    if (message.type === 'progress') {
        document.getElementById('progress').textContent = `Loading: ${message.value} coordinates found`;
    }
    if (message.type === 'fail') {
        document.getElementById('progress').textContent = `Warning: ${message.value}`;
    }
    if (message.type === 'done') {
        document.getElementById('progress').textContent = `Done: ${message.value} coordinates found`;
    }
};

ws.onopen = function(event) {
    ws.send('Client connected');
};