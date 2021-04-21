const { dialog } = require('electron').remote;
const fs = require('fs');
const path = require("path");
const { readdirSync } = require('fs');
const glob = require('glob');

let districtFolderBtn = document.getElementById('districtFolder');
let targetFolderBtn = document.getElementById('targetFolder');
let startCollectionBtn = document.getElementById('startcollecting');

let districtFolderPathVar = '';
let targetFolderPathVar = '';
let logfilename = 'log.txt';

districtFolderBtn.onclick = function () {
    document.getElementById('status').innerText = '';
    dialog.showOpenDialog({
        defaultPath: 'D:\\',
        properties: ['openDirectory']
    }).then(res => {
        let dirPath = res.filePaths[0];
        if (dirPath != undefined){
            document.getElementById('districtfoldername').innerText = path.basename(dirPath);
            districtFolderPathVar = dirPath;
        }
    });
}

targetFolderBtn.onclick = function () {
    document.getElementById('status').innerText = '';
    dialog.showOpenDialog({
        defaultPath: 'D:\\',
        properties: ['openDirectory']
    }).then(res => {
        let dirPath = res.filePaths[0];
        if (dirPath != undefined){
            document.getElementById('targetfoldername').innerText = path.basename(dirPath);
            targetFolderPathVar = dirPath;
        }
    });
}

startCollectionBtn.onclick = function () {
    document.getElementById('status').innerText = 'Running...';
    console.log(districtFolderPathVar, targetFolderPathVar);

    fs.closeSync(fs.openSync(targetFolderPathVar + '/' + logfilename, 'w'));

    let targetSubFolders = getDirectories(targetFolderPathVar);
    let districtSubFolders = getDirectories(districtFolderPathVar);

    for (let d = 0; d < districtSubFolders.length; d++){
        let currentFlightFolder = districtSubFolders[d];

        if(targetSubFolders.includes(currentFlightFolder)){
            logMsg('Skipped Folder: ' + currentFlightFolder);
            continue;
        } else {
            let kmlNShapeFlightFolder = targetFolderPathVar + '/' + currentFlightFolder;
            fs.mkdirSync(kmlNShapeFlightFolder);

            let kmlsFolder = targetFolderPathVar + '/' + currentFlightFolder + '/KMLS';
            let shapefilesFolder = targetFolderPathVar + '/' + currentFlightFolder + '/SHAPEFILES';
            fs.mkdirSync(kmlsFolder);
            fs.mkdirSync(shapefilesFolder);

            let sourceFolder = districtFolderPathVar + '/' + currentFlightFolder;
            
            let kmlFiles = glob.sync('**/*.kml', {cwd: sourceFolder});
            // console.log(kmlFiles);

            for (let k = 0; k < kmlFiles.length; k++){
                let kmlFilePath = sourceFolder + '/' + kmlFiles[k];
                let regex = /\\/g;
                kmlFilePath = kmlFilePath.replace(regex, '/');
                let kmlfilename = path.parse(kmlFilePath).base;

                let eachKMLFolder = kmlsFolder + '/KML-' + (k + 1).toString();
                fs.mkdirSync(eachKMLFolder);

                let targetKMLPath = eachKMLFolder + '/' + kmlfilename;
                console.log(targetKMLPath);

                fs.copyFileSync(kmlFilePath, targetKMLPath);
            }

            let shapefiles = glob.sync('**/*.shp', {cwd: sourceFolder});
            for (let s = 0; s < shapefiles.length; s++){
                let shapefilePath = sourceFolder + '/' + shapefiles[s];
                let regex = /\\/g;
                shapefilePath = shapefilePath.replace(regex, '/');
                let thisshapefilename = path.parse(shapefilePath).name;
                let thisshapefileDir = path.parse(shapefilePath).dir;
                // console.log(thisshapefilename, thisshapefileDir);

                let eachShapefileFolder = shapefilesFolder + '/SHAPEFILE-' + (s + 1).toString();
                fs.mkdirSync(eachShapefileFolder);

                let shapefilesWithAllExtensions = glob.sync(`${thisshapefilename}.*`, {cwd: thisshapefileDir});
                console.log(shapefilesWithAllExtensions);
                for (let se = 0; se < shapefilesWithAllExtensions.length; se++){
                    let shapefilePathEachExtension = thisshapefileDir + '/' + shapefilesWithAllExtensions[se];
                    let regex = /\\/g;
                    shapefilePathEachExtension = shapefilePathEachExtension.replace(regex, '/');
                    let shapefilePathEachExtensionFilename = path.parse(shapefilePathEachExtension).base;

                    let targetShapeFilePathEachExtensions = eachShapefileFolder + '/' + shapefilePathEachExtensionFilename;
                    // console.log(targetShapeFilePathEachExtensions);

                    fs.copyFileSync(shapefilePathEachExtension, targetShapeFilePathEachExtensions);
                }
            }

            logMsg('Created Folder: ' + currentFlightFolder + ' | KMLs Count: ' + kmlFiles.length + ' | Shapefiles Count: ' + shapefiles.length);
        }
    }

    document.getElementById('status').innerText = 'Done...';
}

function logMsg(msg){
    let d = new Date();
    let n = d.toLocaleTimeString();
    fs.appendFileSync(targetFolderPathVar + '/' + logfilename, n + ' > ' + msg + '\n');
}

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)