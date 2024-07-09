const path = require('node:path');
const fs = require('node:fs').promises;
const { JSDOM } = require('jsdom');
const progressEmitter = require('./eventEmitter');

function findBefore(s, sub, startInd) {
    if (s.indexOf(sub) === -1) {
        return -1;
    }
    const found = s.length - s.split('').reverse().join('').indexOf(sub, s.length - startInd - 1) - 1;
    return found;
}

function getTextBetween(s, subStart, subEnd, startInd) {
    if (s.slice(startInd).indexOf(subEnd) === -1) {
        return s.slice(findBefore(s, subEnd, startInd) + 1).replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, ' ').trim();
    }
    return s.slice(findBefore(s, subEnd, startInd) + 1, s.slice(startInd).indexOf(subStart) + startInd).replace(/\n/g, '').replace(/\t/g, '').replace(/  /g, ' ').trim();
}

function findTablesAfterBrowse(html) {
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // Find the <a name="browse"></a> element
    const browse = document.querySelector('a[name="browse"]');
    if (!browse) {
        console.error('The element with name="browse" was not found.');
        return [];
    }

    let tables = [];
    let currentElement = browse.nextElementSibling;

    // Function to recursively check for table elements in children
    function checkForTableInChildNodes(node) {
        if (node.tagName === 'TABLE') {
            tables.push(node);
        }
        Array.from(node.children).forEach(checkForTableInChildNodes);
    }

    // Traverse the DOM starting from the element after browse
    while (currentElement) {
        if (currentElement.tagName === 'TABLE') {
            tables.push(currentElement);
        } else {
            // Check this element's children for tables
            checkForTableInChildNodes(currentElement);
        }
        currentElement = currentElement.nextElementSibling;
    }

    if (tables.length === 0) {
        console.error('No <table> elements found after the element with name="browse".');
    } else {
        //console.log(`Found ${tables.length} <table> elements after the element with name="browse".`);
    }

    return tables;
}

function parseSalesData(html) {
    //html = "<!DOCTYPE html><html><body><a href='#'>Link</a></body></html>";
    //console.log(html)
    
    const tables = findTablesAfterBrowse(html);

    const data = [];
    for (const table of tables) {
        // find all rows in the table
        const rows = Array.from(table.getElementsByTagName('tr'));
        for (const row of rows) {
            const cells = Array.from(row.getElementsByTagName('td'));
            if (cells.length === 2) {
                // get the city name, library name, and everything before the <br> tag in the second cell
                const city = cells[0].querySelector('b').textContent;
                //console.log("City:", city);
                let strcell = cells[0].innerHTML;
                // remove all links in the cell
                strcell = strcell.replace(/<a.*?>/g, '');
                let library = strcell.indexOf('Librar');
                if (library === -1) library = strcell.indexOf('Shop');
                if (library === -1) library = strcell.indexOf('Bookstore');
                if (library === -1) library = strcell.indexOf('Store');
                if (library === -1) library = strcell.indexOf('Cent');
                if (library === -1) library = strcell.indexOf('Gym');
                if (library === -1) library = strcell.indexOf('Book');
                if (library === -1) library = strcell.indexOf('Club');
                if (library === -1) library = strcell.indexOf('College');
                if (library === -1) library = strcell.indexOf('Read');
                if (library === -1) library = strcell.indexOf('Fair');
                if (library !== -1) {
                    // get the library name by finding the first "<" character after "Library", and the first ">" character before it
                    library = getTextBetween(strcell, '<', '>', library);
                } else {
                    // if the library name is not found, get the text after the city name and before the first tag after that
                    library = strcell.split('<br/>')[0];
                    library = library.slice(findBefore(library, '>', library.length - 1) + 1).trim();
                }

                if (library === '' || library === ' ') {
                    library = 'No Name Found';
                }

                //console.log("Library:", library);

                let saleDetails = cells[1].innerHTML;
                //console.log("saleDetails:", saleDetails);

                data.push([city, library, saleDetails]);
            }
        }
    }
    return data;
}

async function convertHTMLDataToJSON(HTMLData) {
    const d3 = await import('d3-dsv');

    const data = await parseSalesData(HTMLData);

    // Convert the data array to a CSV string
    let csv = 'City,Library,SaleDetails\n';
    for (const row of data) {
        csv += row.map(value => `"${value.replaceAll("\"", "\'")}"`).join(',') + '\n';
    }

    return d3.csvParse(csv);
}

// This function will be called from the frontend API
// HTML data will be uploaded by the user
// state will have to be selected in order to show the upload button
async function saveHTMLtoCSV(HTMLData, state) {
    const d3 = await import('d3-dsv');

    const data = await convertHTMLDataToJSON(HTMLData);

    if (data.length === 0) {
        progressEmitter.emit('progress', 'No sales data found in HTML');
        throw new Error('No sales data found in HTML');
    }

    const csv = await d3.csvFormat(data);

    const stateSalesCSVPath = path.join(__dirname, '..', 'stateSalesCSV', `salesData${state}.csv`);
    await fs.writeFile(stateSalesCSVPath, csv);
}

module.exports = { saveHTMLtoCSV };