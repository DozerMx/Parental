const { spawn } = require('child_process');
const path = require('path');

function startApp() {
    const electronProcess = spawn('electron', ['.'], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
    });
    
    electronProcess.unref();
}

startApp();
