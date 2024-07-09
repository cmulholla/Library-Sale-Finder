const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('maps', {
  getData: (state) => ipcRenderer.invoke('maps:get-data', state),
  uploadHTML: (html, state) => ipcRenderer.invoke('maps:upload-html', html, state),
  getFilePath: () => ipcRenderer.invoke('maps:get-file-path'),
  addSale: (city, state, libraryName, saleDetails, lat, lon, index) => ipcRenderer.invoke('maps:add-sale', city, state, libraryName, saleDetails, lat, lon, index),
  grabSale: (state, index) => ipcRenderer.invoke('maps:grab-sale', state, index),
  getUserData: (state) => ipcRenderer.invoke('maps:get-user-data', state),
  getDateAdded: (state) => ipcRenderer.invoke('maps:get-date-added', state),
})

contextBridge.exposeInMainWorld('helloWorld', {
  helloWorld: (data) => ipcRenderer.invoke('myAPI:hello-world', data)
})