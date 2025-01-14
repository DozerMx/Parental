const { exec } = require('child_process');

// Solo iniciar la aplicación Electron
exec('start cmd /c electron .', { windowsHide: true });
