const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system'),
})

contextBridge.exposeInMainWorld('maps', {
  getData: () => ipcRenderer.invoke('maps:get-data'),
})

contextBridge.exposeInMainWorld('helloWorld', {
  helloWorld: (data) => ipcRenderer.invoke('myAPI:hello-world', data)
})