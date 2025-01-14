const { exec } = require('child_process');
const path = require('path');

console.log('Iniciando aplicación...');

try {
    // Verificar que electron está instalado
    const electronPath = require('electron');
    console.log('Electron encontrado, iniciando aplicación...');

    // Iniciar la aplicación con más información
    const electronProcess = exec('electron .', { windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
            console.error('Error al ejecutar Electron:', error);
            return;
        }
        if (stderr) {
            console.error('Error en la salida de Electron:', stderr);
            return;
        }
        console.log('Salida de Electron:', stdout);
    });

    electronProcess.on('error', (error) => {
        console.error('Error en el proceso:', error);
    });

} catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    
    // Si electron no está instalado, mostrar mensaje claro
    if (error.code === 'MODULE_NOT_FOUND') {
        console.error('\nParece que Electron no está instalado. Por favor, ejecuta:\nnpm install electron socket.io-client\n');
    }
}
