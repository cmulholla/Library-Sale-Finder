const fs = require('fs').promises;

const createMapData = async (filePath) => {
  const fileContent = await fs.readFile(filePath);

  const parse = (await import('csv-parse/lib/sync')).default;
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Transform records into Plotly trace data
  const traceData = {
    type: 'scattergeo',
    mode: 'markers',
    text: records.map(record => record.info),
    lon: records.map(record => record.lon),
    lat: records.map(record => record.lat),
    marker: {
      size: 8,
      line: {
        color: 'black',
        width: 2
      },
    }
  };

  // This is the data structure expected by Plotly.js
  // You can further customize this for different visual appearances or add more traces
  const layout = {
    title: 'Map Generated from CSV',
    geo: {
      scope: 'world',
      projection: {
        type: 'natural earth'
      },
      showland: true,
      landcolor: 'rgb(243, 243, 243)',
      countrycolor: 'rgb(204, 204, 204)'
    },
  };

  // Return both the trace data and layout for rendering in the frontend
  return { data: [traceData], layout };
};

module.exports = createMapData;