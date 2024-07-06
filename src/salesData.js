// Adjusted salesData.js to use dynamic import for d3-fetch
const path = require('node:path');
const fs = require('node:fs').promises;

async function loadData() {
    try {
        const filePath = path.join(__dirname, '..', 'CSVdata', 'salesDataLonLatMI.csv');
        const data = await fs.readFile(filePath, 'utf8');
        // Process your CSV data here
        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        throw error; // Rethrow or handle as needed
    }
}

module.exports = { loadData };