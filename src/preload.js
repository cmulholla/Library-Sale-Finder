const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('maps', {
  getData: (state) => ipcRenderer.invoke('maps:get-data', state),
  uploadHTML: (html, state) => ipcRenderer.invoke('maps:upload-html', html, state),
  getFilePath: () => ipcRenderer.invoke('maps:get-file-path')
})

contextBridge.exposeInMainWorld('helloWorld', {
  helloWorld: (data) => ipcRenderer.invoke('myAPI:hello-world', data)
})