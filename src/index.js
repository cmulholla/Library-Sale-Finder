const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('node:path')
let salesData = require('./salesData');

function createWindow () {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.webContents.openDevTools() // Automatically open dev tools
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