// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

// Expose methods to the renderer process
contextBridge.exposeInMainWorld('electron', {
  changeFilePath: () => ipcRenderer.invoke('dialog:changeFilePath'),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveJson: (jsonData, filePath) => ipcRenderer.invoke('saveJson', jsonData),
});
