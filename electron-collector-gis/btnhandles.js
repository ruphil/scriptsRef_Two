const { dialog } = require('electron').remote;
const {ipcRenderer} = require('electron');

let btnsourcefolder = document.getElementById('btnsourcefolder');
let divsourcefolder = document.getElementById('divsourcefolder');

let btnxlfile = document.getElementById('btnxlfile');
let divxlfile = document.getElementById('divxlfile');

let btntargetfolder = document.getElementById('btntargetfolder');
let divtargetfolder = document.getElementById('divtargetfolder');

let divstatus = document.getElementById('divstatus');
let currentFlightID = document.getElementById('currentFlightID');
let btnexit = document.getElementById('btnexit');

btnsourcefolder.onclick = function () {
    divstatus.innerText = '';
    dialog.showOpenDialog({
        title: 'Select Source Folder',
        defaultPath: 'D:\\',
        properties: ['openDirectory']
    }).then(res => {
        if(!res.canceled){
            divsourcefolder.innerText = res.filePaths[0].toString();
            
            sourcefolderPath = res.filePaths[0];
            // console.log(sourcefolderPath);
        }
    });
}

btnxlfile.onclick = function () {
    divstatus.innerText = '';
    dialog.showOpenDialog({
        title: 'Select Flight IDs Excel File',
        defaultPath: 'D:\\',
        properties: ['openFile']
    }).then(res => {
        if(!res.canceled){
            let extension = path.extname(res.filePaths[0]);

            if(extension != '.xlsx'){
                divxlfile.innerText = '';
                xlFilePath = '';
                divstatus.innerText = 'Select Excel File...';
            } else {
                divxlfile.innerText = res.filePaths[0].toString();
                xlFilePath = res.filePaths[0];
                // console.log(xlFilePath);
            }
        }
    });
}

btntargetfolder.onclick = function () {
    divstatus.innerText = '';
    dialog.showOpenDialog({
        title: 'Select Target Folder',
        defaultPath: 'D:\\',
        properties: ['openDirectory']
    }).then(res => {
        if(!res.canceled){
            divtargetfolder.innerText = res.filePaths[0].toString();
            
            targetfolderPath = res.filePaths[0];
            // console.log(sourcefolderPath);
        }
    });
}

btnexit.onclick = function(){
    ipcRenderer.send('close-me');
}
