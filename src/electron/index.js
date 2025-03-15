const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.removeMenu();

  const electronVariables = {
    currentOpenedFilePath: ''
  }

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Listen for a request to open a JSON file
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });
    if (result.canceled) return;
    electronVariables.currentOpenedFilePath = result.filePaths[0]
    return fs.readFileSync(electronVariables.currentOpenedFilePath, 'utf-8');
  });

  // Listen for a request to obtain a File Path
  ipcMain.handle('dialog:changeFilePath', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      properties: ['showHiddenFiles'],
      filters: [{ name: 'JSON Files', extensions: ['json']}]
    });
    if (result.canceled) return false;
    electronVariables.currentOpenedFilePath = result.filePath;
    return true;
  });

  // Listen for a request to save the edited JSON data
  ipcMain.handle('saveJson', async (event, jsonData) => {
    try {
      fs.writeFileSync(electronVariables.currentOpenedFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
      return true;
    } catch (e) {
      return false;
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
