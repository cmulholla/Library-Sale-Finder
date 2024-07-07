const { read } = require('node:fs');
const path = require('node:path');
const fs = require('node:fs').promises;
const progressEmitter = require('./eventEmitter');

// Load the data from the CSV file stored in the CSVdata folder
// If the data is not in the CSVdata folder, grab it from stateSalesCSV folder
// - stateSalesCSV folder is a folder that contains the sales data for each state, but not lat and lon which is needed to plot
// - use nominatim to get the lat and lon for each city in the CSV file

async function getLatLon(city, state, country) {
    try {
        // dynamically import fetch
        const { default: fetch } = await import('node-fetch');

        const url = `https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&country=${country}&format=json&namedetails=1&accept-language=en&zoom=3`;
        const headers = {'User-Agent': 'abcd'};
        const response = await fetch(url, { headers });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting lat and lon:', error);
        throw error; // Rethrow or handle as needed
    }
}

async function makeLonLatCSV(data, findState) {
    // input data is an array of objects with the following keys: City, State, Country, Library, SaleDetails
    const d3 = await import('d3-dsv');
    try {
        var csv = 'Latitude,Longitude,Library,SaleDetails\n';
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            var city = row.City;
            // clean the city name input by removing any special characters
            city = city.replace(/[^a-zA-Z ]/g, "");
            var state = row.State;
            if (state != findState) {
                console.log('State does not match:', state, findState);
                progressEmitter.emit('progress', `State does not match: ${state}, ${findState}`);
                continue;
            }
            var country = row.Country;
            try {
                var latLon = await getLatLon(city, state, country);
                // convert to JSON object
                latLon = JSON.parse(JSON.stringify(latLon));
                if (latLon.length === 0) {
                    console.log('No lat and lon found for', city, state, country);
                    progressEmitter.emit('progress', `No lat and lon found for ${city}, ${state}, ${country}`);
                    continue;
                }
                console.log(`Lat and Lon found for ${i} of ${data.length}`)
                progressEmitter.emit('progress', `${i} of ${data.length}`);
            }
            catch (error) {
                console.error('Error getting lat and lon:', error);
                progressEmitter.emit('progress', error);
                continue;
            }
            var lat = latLon[0].lat;
            var lon = latLon[0].lon;
            var library = row.Library;
            var saleDetails = row.SaleDetails;
            // Add some random jitter to the lat and lon to avoid overlapping points
            lat = parseFloat(lat) + (Math.random() - 0.5) * 0.1;
            lon = parseFloat(lon) + (Math.random() - 0.5) * 0.1;

            csv += `${lat},${lon},"${library}","${saleDetails}"\n`;
        }
        progressEmitter.emit('progress', `${data.length}`);
        return csv;
    } catch (error) {
        console.error('Error making lon and lat CSV:', error);
        progressEmitter.emit('progress', error);
        throw error; // Rethrow or handle as needed
    }
}

async function readStateSalesCSV(state) {
    const stateSalesCSVPath = path.join(__dirname, '..', 'stateSalesCSV', `salesData${state}.csv`);
    const stateSalesCSVExists = await fs.access(stateSalesCSVPath).then(() => true).catch(() => false);

    if (!stateSalesCSVExists) {
        /////////// call grabSalesData.js here to create the new file
        throw new Error(`State sales data for ${state} not found`);
    }

    const stateSalesCSV = await fs.readFile(stateSalesCSVPath, 'utf8');
    
    // Process your CSV data here

    // import d3 dynamically
    const d3 = await import('d3-dsv');
    var stateSalesJSON = d3.csvParse(stateSalesCSV);

    // parse the "City" column (containing "City, State") into "City" and "State" columns, and add a "Country" column
    for (var i = 0; i < stateSalesJSON.length; i++) {
        try {
            var cityState = stateSalesJSON[i].City;
            var cityStateSplit = cityState.split(', ');
            stateSalesJSON[i].City = cityStateSplit[0];
            stateSalesJSON[i].State = cityStateSplit[1];
            stateSalesJSON[i].Country = 'USA';
        }
        catch (error) {
            console.error('Error parsing city and state:', error);
            continue;
        }
    }

    return stateSalesJSON;
}

async function loadData(state) {
    const salesDataPath = path.join(__dirname, '..', 'CSVdata', `salesDataLonLat${state}.csv`);
    const salesDataExists = await fs.access(salesDataPath).then(() => true).catch(() => false);

    if (!salesDataExists) {
        console.log(`Sales data with lat and lon for ${state} not found, creating it now`);
        var rawSalesData = await readStateSalesCSV(state);
        //console.log(rawSalesData[0])
        if (rawSalesData === null || rawSalesData === undefined || rawSalesData.length === 0) {
            console.error('Error reading state sales data:', rawSalesData);
            return null;
        }
        const data = await makeLonLatCSV(rawSalesData, state);
        await fs.writeFile(salesDataPath, data);
    }

    const salesData = await fs.readFile(salesDataPath, 'utf8');
    // Process your CSV data here
    return salesData;
}

module.exports = { loadData };