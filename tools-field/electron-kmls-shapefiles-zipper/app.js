const { dialog } = require('electron').remote;
const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require("path");
const glob = require('glob');
const archiver = require('archiver');

let inputfligntno = document.getElementById('inputfligntno');
let flightdate = document.getElementById('flightdate');
let rawdataFoldersbtn = document.getElementById('rawdataFoldersbtn');
let zipfolderbtn = document.getElementById('zipfolderbtn');
let makeZipbtn = document.getElementById('makeZipbtn');
let exitbtn = document.getElementById('exitbtn');

let outrawDataStatus = document.getElementById('outrawDataStatus');
let outzipfoldername = document.getElementById('outzipfoldername');
let statusout = document.getElementById('statusout');

let flightsRawFolders = [];
let targetFolder = 'D:/';
let droneno = inputfligntno.value;

window.onload = function(){
    let now = new Date();
    let day = ("0" + now.getDate()).slice(-2);
    let month = ("0" + (now.getMonth() + 1)).slice(-2);
    let today = now.getFullYear()+"-"+(month)+"-"+(day);
    flightdate.value = today;
}

inputfligntno.onchange = function () {
    statusout.innerText = '';
    droneno = inputfligntno.value;
    console.log(droneno);
}

rawdataFoldersbtn.onclick = function () {
    statusout.innerText = '';
    dialog.showOpenDialog({
        title: 'Select Flights Raw Data Folder for Today',
        defaultPath: 'D:\\',
        properties: ['openDirectory', 'multiSelections']
    }).then(res => {
        if(!res.canceled){
            if(res.filePaths.length == 1){
                outrawDataStatus.innerText = 'You have made ' + res.filePaths.length.toString() + ' flight today';
            } else {
                outrawDataStatus.innerText = 'You have made ' + res.filePaths.length.toString() + ' flights today';
            }
            
            flightsRawFolders = res.filePaths;
            console.log(flightsRawFolders);
        }
    });
}

zipfolderbtn.onclick = function () {
    statusout.innerText = '';
    dialog.showOpenDialog({
        title: 'Select Target Folder for Zip File',
        defaultPath: 'D:\\',
        properties: ['openDirectory']
    }).then(res => {
        if(!res.canceled){
            outzipfoldername.innerText = res.filePaths[0];
            targetFolder = res.filePaths[0];
            console.log(targetFolder);
        }
    });
}

exitbtn.onclick = function(){
    ipcRenderer.send('close-me');
}

makeZipbtn.onclick = function(){
    statusout.innerText = 'Running... Please Wait...';

    let zipname = flightdate.value + '-' + customTime() + '-' + droneno + '.zip';
    let zippath = path.join(targetFolder, zipname);
    console.log(zippath);

    let zipout = fs.createWriteStream(zippath);
    let archive = archiver('zip', {
        zlib: { level: 9 }
    });

    zipout.on('close', function() {
        setTimeout(() => {
            statusout.innerText = 'Done...';    
        }, 2000);
    });

    archive.pipe(zipout);

    archive = copyDataToArchive(archive);

    archive.finalize();
}

function customTime(){
    let now = new Date();
    let timeStr = now.toTimeString().split(':')[0] + "-" + now.toTimeString().split(':')[1];
    return timeStr;
}

function copyDataToArchive(archive){
    archive = copyKMLToArchive(archive);
    archive = copyShapesToArchive(archive);
    return archive;
}

function copyKMLToArchive(archive){
    for(let i = 0; i < flightsRawFolders.length; i++){
        let foldername_flightID = path.parse(flightsRawFolders[i]).base;
        let kmlFiles = glob.sync('**/*.kml', {cwd: flightsRawFolders[i]});
        // console.log(kmlFiles);

        for (let k = 0; k < kmlFiles.length; k++){
            let kmlFilePath = path.join(flightsRawFolders[i], kmlFiles[k]);

            let kmlfilename = path.parse(kmlFilePath).base;

            let filePathInsideZip = foldername_flightID + '/KMLS/KML-' + (k + 1).toString() + '/' + kmlfilename;

            archive.file(kmlFilePath, { name: filePathInsideZip });
        }
    }
    return archive;
}

function copyShapesToArchive(archive){
    for(let i = 0; i < flightsRawFolders.length; i++){
        let foldername_flightID = path.parse(flightsRawFolders[i]).base;
        let shapefiles = glob.sync('**/*.shp', {cwd: flightsRawFolders[i]});

        for (let s = 0; s < shapefiles.length; s++){
            let shapefilePath = path.join(flightsRawFolders[i], shapefiles[s]);

            let thisshapefilename = path.parse(shapefilePath).name;
            let thisshapefileDir = path.parse(shapefilePath).dir;
            // console.log(thisshapefilename, thisshapefileDir);

            let shapeFormats = ['.cpg', '.dbf', '.prj', '.sbn', '.sbx', '.shp', '.shx'];
            for (let f = 0; f < shapeFormats.length; f++){
                let shapefilenameWithFormat = thisshapefilename + shapeFormats[f];
                let foundFiles = glob.sync(shapefilenameWithFormat, {cwd: thisshapefileDir});
                if(foundFiles.length == 1){
                    // console.log(foundFiles);

                    let shapefilePath = path.join(thisshapefileDir, foundFiles[0]);
                    let filePathInsideZip = foldername_flightID + '/SHAPEFILES/SHAPEFILE-' + (s + 1).toString() + '/' + shapefilenameWithFormat;
                    // console.log(shapefilePath, filePathInsideZip);

                    archive.file(shapefilePath, { name: filePathInsideZip });
                }
            }
        }
    }
    return archive;
}