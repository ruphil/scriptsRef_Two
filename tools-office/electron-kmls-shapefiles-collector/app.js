const { dialog } = require('electron').remote;
const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require("path");
const glob = require('glob');
const archiver = require('archiver');
const dateformat = require('dateformat');

let systemidentifier = document.getElementById('systemidentifier');
let btnuniquesourcefolder = document.getElementById('btnuniquesourcefolder');
let divuniquesourcefolder = document.getElementById('divuniquesourcefolder');
let btntargetparentfolder = document.getElementById('btntargetparentfolder');
let divtargetparentfolder = document.getElementById('divtargetparentfolder');
let makeZipbtn = document.getElementById('makeZipbtn');
let divstatus = document.getElementById('divstatus');
let btnexit = document.getElementById('btnexit');

let uniquezipname = '';
let sourceFolders = [];
let targetFolder = 'D:/';
let outCSVFile = '';

let currentKMLNo = 1;
let currentShapeFileNo = 1;

btnuniquesourcefolder.onclick = function () {
    divstatus.innerText = '';
    dialog.showOpenDialog({
        title: 'Select Source Folders',
        defaultPath: 'D:\\',
        properties: ['openDirectory', 'multiSelections']
    }).then(res => {
        if(!res.canceled){
            divuniquesourcefolder.innerText = res.filePaths.toString();
            
            sourceFolders = res.filePaths;
            console.log(sourceFolders);
        }
    });
}

btntargetparentfolder.onclick = function () {
    divstatus.innerText = '';
    dialog.showOpenDialog({
        title: 'Select Target Folder',
        defaultPath: 'D:\\',
        properties: ['openDirectory']
    }).then(res => {
        if(!res.canceled){
            divtargetparentfolder.innerText = res.filePaths[0];
            targetFolder = res.filePaths[0];
            console.log(targetFolder);
        }
    });
}

btnexit.onclick = function(){
    ipcRenderer.send('close-me');
}

makeZipbtn.onclick = function(){
    divstatus.innerText = 'Running... Please Wait...';

    uniquezipname = systemidentifier.value;
    outCSVFile = path.join(targetFolder, uniquezipname) + '.csv';

    let csvData = '"FILE_PATH","DATE_MODIFIED","SYSTEM_IDENFIER","LOCATION_IN_ZIP"\n';
    fs.appendFileSync(outCSVFile, csvData);

    let zipname = uniquezipname + '.zip';
    let zippath = path.join(targetFolder, zipname);
    console.log(zippath);

    let zipout = fs.createWriteStream(zippath);
    let archive = archiver('zip', {
        zlib: { level: 9 }
    });

    zipout.on('pipe', function(){
        divstatus.innerText = 'Data being Piped into Zip...';
    });

    zipout.on('close', function() {
        setTimeout(() => {
            divstatus.innerText = 'Done...';
        }, 500);
    });

    archive.pipe(zipout);

    archive = copyDataToArchive(archive);

    archive.finalize();
}

function copyDataToArchive(archive){
    archive = copyKMLToArchive(archive);
    archive = copyShapesToArchive(archive);
    return archive;
}

function copyKMLToArchive(archive){
    if(sourceFolders.length == 0) return archive;

    for(let i = 0; i < sourceFolders.length; i++){
        let kmlFiles = glob.sync('**/*.kml', {cwd: sourceFolders[i]});

        for (let k = 0; k < kmlFiles.length; k++){
            let kmlFilePath = path.join(sourceFolders[i], kmlFiles[k]);

            let dateModified = dateformat(fs.statSync(kmlFilePath).mtime, "dd/mm/yyyy");

            let kmlfilename = path.parse(kmlFilePath).base;

            let filePathInsideZip = 'KMLS/KML-' + currentKMLNo.toString() + '/' + kmlfilename;
            
            currentKMLNo++;

            archive.file(kmlFilePath, { name: filePathInsideZip });

            let csvData = '"' + kmlFilePath + '","' + dateModified + '","' + uniquezipname + '","' + filePathInsideZip + '"' + '\n';
            fs.appendFileSync(outCSVFile, csvData);
        }
    }
    return archive;
}

function copyShapesToArchive(archive){
    if(sourceFolders.length == 0) return archive;

    for(let i = 0; i < sourceFolders.length; i++){
        let shapefiles = glob.sync('**/*.shp', {cwd: sourceFolders[i]});

        for (let s = 0; s < shapefiles.length; s++){
            let shapefilePath = path.join(sourceFolders[i], shapefiles[s]);

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

                    let dateModified = dateformat(fs.statSync(shapefilePath).mtime, "dd/mm/yyyy");

                    let filePathInsideZip = 'SHAPEFILES/SHAPEFILE-' + currentShapeFileNo.toString() + '/' + shapefilenameWithFormat;
                    // console.log(shapefilePath, filePathInsideZip);

                    archive.file(shapefilePath, { name: filePathInsideZip });
                    
                    let csvData = '"' + shapefilePath + '","' + dateModified + '","' + uniquezipname + '","' + filePathInsideZip + '"' + '\n';
                    fs.appendFileSync(outCSVFile, csvData);
                }
            }
            currentShapeFileNo++;
        }
    }
    return archive;
}