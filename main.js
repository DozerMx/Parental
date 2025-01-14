import { app, BrowserWindow, screen, globalShortcut } from 'electron';
import { io } from 'socket.io-client';
import path from 'path';

let mainWindow;
const socket = io('http://localhost:3000');

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  
  // Deshabilitar Alt+F4
  mainWindow.setClosable(false);
  
  // Bloquear todas las combinaciones de teclas comunes
  globalShortcut.register('Alt+Tab', () => {});
  globalShortcut.register('Alt+F4', () => {});
  globalShortcut.register('CommandOrControl+W', () => {});
  globalShortcut.register('CommandOrControl+R', () => {});
}

app.whenReady().then(createWindow);

// Manejar eventos del servidor
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

socket.on('task', (task) => {
  if (mainWindow) {
    mainWindow.webContents.send('updateTask', task);
  }
});
