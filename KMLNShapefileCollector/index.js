const electron = require('electron');

let browWin = electron.BrowserWindow;

let WIN = new browWin({width: 800, height: 600})

let filePaths = electron.dialog.showOpenDialog(WIN, { properties: ['openFile', 'multiSelections'] })
console.log(filePaths);