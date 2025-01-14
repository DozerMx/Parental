const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');
const { io } = require('socket.io-client');
const path = require('path');

let mainWindow;
const socket = io('http://192.168.1.88:3000');

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setClosable(false);
  
  globalShortcut.register('Alt+Tab', () => {});
  globalShortcut.register('Alt+F4', () => {});
  globalShortcut.register('CommandOrControl+W', () => {});
  globalShortcut.register('CommandOrControl+R', () => {});
}

app.whenReady().then(createWindow);

socket.on('block', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }
});

socket.on('unblock', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

socket.on('updateTask', (task) => {
  if (mainWindow) {
    mainWindow.webContents.send('taskUpdate', task);
  }
});

socket.on('initialState', (state) => {
  if (mainWindow) {
    if (state.isBlocked) {
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      mainWindow.hide();
    }
    mainWindow.webContents.send('taskUpdate', state.currentTask);
  }
});
