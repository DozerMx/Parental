const { app, BrowserWindow, screen, globalShortcut } = require('electron');
const { io } = require('socket.io-client');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;
let isBlocked = true; // Variable para trackear el estado
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
  
  // Bloquear combinaciones de teclas
  globalShortcut.registerAll(['Alt+Tab', 'Alt+F4', 'CommandOrControl+W', 'CommandOrControl+R', 
    'CommandOrControl+Shift+I', 'F11', 'Alt+Space', 'CommandOrControl+Tab', 'Alt+Esc', 
    'CommandOrControl+Shift+Esc', 'CommandOrControl+Alt+Delete'], () => {
    return false;
  });

  // Prevenir el cierre de la ventana
  mainWindow.on('close', (e) => {
    if (isBlocked) {
      e.preventDefault();
    }
  });
}

// Auto-reinicio si el proceso termina
app.on('window-all-closed', () => {
  if (isBlocked) {
    exec('start cmd.exe /c "node start.js"', { windowsHide: true });
  }
});

app.whenReady().then(() => {
  createWindow();
  
  // Mantener la ventana visible solo si está bloqueado
  setInterval(() => {
    if (mainWindow && isBlocked && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }, 1000);
});

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
