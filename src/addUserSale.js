const path = require('node:path')
let salesData = require('./salesData'); // salesData.getLatLon(city, state, country)
const fs = require('node:fs').promises;
const progressEmitter = require('./eventEmitter');

// Take in a user's sale data and add it to the sales data
// This function is called from the renderer process
// inputs: city, state, libraryName, saleDetails, lat (opt.), lon (opt.), index (opt.)
// outputs: true if successful, false if not

async function addUserSale(city, state, libraryName, saleDetails, lat, lon, index) {
    const d3 = await import('d3-dsv');
    // Check if the user has provided a lat and lon
    if (!lat || !lon) {
        // If not, get the lat and lon from the city, state, and country
        try {
            var latLon = await salesData.getLatLon(city, state, 'USA');
            // convert to JSON object
            latLon = JSON.parse(JSON.stringify(latLon));
            if (latLon.length === 0) {
                console.log('No lat and lon found for', city, state, 'USA');
                progressEmitter.emit('progress', `No lat and lon found for ${city}, ${state}, USA`);
                return false;
            }
            lat = latLon[0].lat;
            lon = latLon[0].lon;

            // Add some random jitter to the lat and lon to avoid overlapping points
            lat = parseFloat(lat) + (Math.random() - 0.5) * 0.05;
            lon = parseFloat(lon) + (Math.random() - 0.5) * 0.05;
        }
        catch (error) {
            console.error('Error getting lat and lon:', error);
            progressEmitter.emit('progress', error);
            return false;
        }
    }

    // Append the new sale to ../addedCSVdata/userSales{state}.csv

    // Get the path to the user sales CSV file
    const userSalesCSVPath = path.join(__dirname, '..', 'addedCSVdata', `userSales${state}.csv`);

    // Check if the file exists, if not, create it
    const userSalesCSVExists = await fs.access(userSalesCSVPath).then(() => true).catch(() => false);
    if (!userSalesCSVExists) {
        await fs.writeFile(userSalesCSVPath, 'Latitude,Longitude,Library,SaleDetails\n');
    }

    // if index is provided, update the sale at that index
    if (index) {

        // Read the file with ds3
        const file = await fs.readFile(userSalesCSVPath, 'utf8');
        csv = d3.csvParse(file);

        // Check if the index is valid
        if (index < 1 || index >= csv.length + 1) {
            console.error('Invalid index');
            progressEmitter.emit('progress', `Invalid index`);
            return false;
        }

        index -= 1; // Convert to 0-based index

        // Update the sale at the index
        csv[index].Latitude = lat;
        csv[index].Longitude = lon;
        csv[index].Library = libraryName;
        csv[index].SaleDetails = saleDetails;

        // Write the updated CSV to the file
        await fs.writeFile(userSalesCSVPath, d3.csvFormat(csv));

        // Emit progress event
        progressEmitter.emit('progress', `Updated sale at index ${index}`);

        return true;
    }
    else {
        // Find the index of the last sale
        const file = await fs.readFile(userSalesCSVPath, 'utf8');
        var csv = d3.csvParse(file);

        // Get the last index
        const lastIndex = csv.length + 1;

        // Create the CSV string
        var csv = `${lat},${lon},"${libraryName} - ${lastIndex}","${saleDetails}\n"`;

        // Append the new sale to the file
        await fs.appendFile(userSalesCSVPath, "\n"+csv);

        // Emit progress event
        progressEmitter.emit('progress', `Added sale to ${state} data`);

        return true;
    }
}

async function grabUserSalesCSVatIndex(state, index) {
    // Get the path to the user sales CSV file
    const userSalesCSVPath = path.join(__dirname, '..', 'addedCSVdata', `userSales${state}.csv`);

    // Check if the file exists
    const userSalesCSVExists = await fs.access(userSalesCSVPath).then(() => true).catch(() => false);
    if (!userSalesCSVExists) {
        throw new Error(`User sales data for ${state} not found`);
    }

    // import d3 dynamically
    const d3 = await import('d3-dsv');

    // Read the file with ds3
    const file = await fs.readFile(userSalesCSVPath, 'utf8');
    var csv = d3.csvParse(file);
    
    // Check if the index is valid
    if (index < 1 || index >= csv.length + 1) {
        console.error('Invalid index');
        progressEmitter.emit('progress', `Invalid index`);
        return false;
    }

    // Get the sale at the index
    const sale = csv[index-1];

    // Emit progress event
    progressEmitter.emit('progress', `Got sale at index ${index}`);

    return sale;
}

module.exports = { addUserSale, grabUserSalesCSVatIndex };