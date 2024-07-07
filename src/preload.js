const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('maps', {
  getData: (state) => ipcRenderer.invoke('maps:get-data', state),
})

contextBridge.exposeInMainWorld('helloWorld', {
  helloWorld: (data) => ipcRenderer.invoke('myAPI:hello-world', data)
})