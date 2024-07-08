const { app, BrowserWindow, ipcMain, nativeTheme, dialog } = require('electron')
const path = require('node:path')
let salesData = require('./salesData');
let grabSalesData = require('./grabSalesData');
let addUserSale = require('./addUserSale'); // addUserSale, grabUserSalesCSVatIndex 
const fs = require('node:fs').promises;
const WebSocket = require('ws');
const progressEmitter = require('./eventEmitter');

function createWindow () {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  //win.webContents.openDevTools() // Automatically open dev tools
  win.loadFile(path.join(__dirname, 'index.html'))
}

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})

ipcMain.handle('myAPI:hello-world', (event, strdata) => {
  return strdata + ' world!<br>' + JSON.stringify(event)
})

ipcMain.handle('maps:get-data', async (event, state) => {
  console.log("Running salesData.loadData()")
  var mapData = await salesData.loadData(state)
  
  if (mapData === null) {
    return []
  }
  
  return mapData
})

ipcMain.handle('maps:upload-html', async (event, fpath, state) => {
  // Read the HTML file from the path
  const html = await fs.readFile(fpath, 'utf8');

  try {
    if (html === null || html === '') {
      throw new Error('No HTML data');
    }
    await grabSalesData.saveHTMLtoCSV(html, state);
  }
  catch (error) {
    console.error('Error saving HTML to CSV:', error);
    return false;
  }

  // delete the LonLat data if it exists for the state
  var latLonPath = path.join(__dirname, '..', 'CSVdata', `salesDataLonLat${state}.csv`);
  var latLonExists = await fs.access(latLonPath).then(() => true).catch(() => false);
  if (latLonExists) {
    await fs.unlink(latLonPath);
  }

  return true;
})

ipcMain.handle('maps:get-file-path', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  });
  if (canceled) {
    return false; // User canceled the dialog
  } else {
    return filePaths[0];
  }
})

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    progressEmitter.on('progress', progress => {
        ws.send(JSON.stringify({ type: 'progress', value: progress }));
    });
});

//  addUserSale, grabUserSalesCSVatIndex

//city, state, libraryName, saleDetails, lat, lon, index
ipcMain.handle('maps:add-sale', async (event, city, state, libraryName, saleDetails, lat, lon, index) => {
  var result = await addUserSale.addUserSale(city, state, libraryName, saleDetails, lat, lon, index);
  return result;
})

ipcMain.handle('maps:grab-sale', async (event, state, index) => {
  var result = await addUserSale.grabUserSalesCSVatIndex(state, index);
  return result;
})

ipcMain.handle('maps:get-user-data', async (event, state) => {
  var userSales = await salesData.loadUserData(state);
  return userSales;
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})