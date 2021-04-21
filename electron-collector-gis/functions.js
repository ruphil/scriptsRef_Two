const fs = require('fs');
const path = require("path");
const glob = require('glob');
const archiver = require('archiver');
const dateformat = require('dateformat');
const XLSX = require('xlsx');

let btnstartsearching = document.getElementById('btnstartsearching');

btnstartsearching.onclick = function(){
    divstatus.innerText = 'Running... Please Wait...';

    if (sourcefolderPath == '' || xlFilePath == '' || targetfolderPath == ''){
        divstatus.innerText = 'Select All Fields...';
        return 0;
    }

    missingFlightIDsXlData = getColumnsData(['A','B','C'], xlFilePath);
    // console.log(missingFlightIDsXlData);

    allFolderNamesList = getAllFolderNamesInSourceWithPaths();
    // console.log(allFolderNamesList);

    for (let i = 0; i < missingFlightIDsXlData.length; i++){

        let whetherFound = missingFlightIDsXlData[i][1];
        let missingFlightID = missingFlightIDsXlData[i][0];

        currentFlightID.innerText = missingFlightID + ': ' + (i+1).toString() + ' of ' + missingFlightIDsXlData.length;

        if(whetherFound != 'Found'){
            startSearchingFolder(missingFlightID);
        } else {
            console.log(missingFlightID, 'Already Found');
        }
    }
    
    saveXLFile(missingFlightIDsXlData, xlFilePath);
    divstatus.innerText = 'Done...';    
}

function startSearchingFolder(missingFlightID){
    missingFlightID = missingFlightID.replace(/[^a-z0-9_+-]/gi, '');
    let flightIDPath = path.join(targetfolderPath, missingFlightID);
    if (!fs.existsSync(flightIDPath)){
        fs.mkdirSync(flightIDPath);
    }

    let foldersListToXL = [];
    for(let i = 0; i < allFolderNamesList.length; i++){
        let folderName = allFolderNamesList[i][0];
        let sourceFolderSinglePath = allFolderNamesList[i][1];

        let similarity = checkStringSimilarity(missingFlightID, folderName);

        if(similarity){
            // console.log(missingFlightID, folderName);
            foldersListToXL.push(sourceFolderSinglePath);

            startCopyingData(missingFlightID, folderName, sourceFolderSinglePath);
        }
    }

    if (foldersListToXL.length > 0){
        updateFlightsIDsXLData(missingFlightID, foldersListToXL);
    }
}

function updateFlightsIDsXLData(missingFlightID, foldersListToXL){
    for (let i = 0; i < missingFlightIDsXlData.length; i++){
        let missingFlightIDXL = missingFlightIDsXlData[i][0];
        if(missingFlightID == missingFlightIDXL){
            missingFlightIDsXlData[i][1] = 'Found';
            missingFlightIDsXlData[i][2] = foldersListToXL.join(', ');
        }
    }
}

function startCopyingData(missingFlightID, folderName, sourceFolderSinglePath){
    missingFlightID = missingFlightID.replace(/[^a-z0-9_+-]/gi, '');
    folderName = folderName.replace(/[^a-z0-9_+-]/gi, '');

    let targetFolderSinglePath = path.join(targetfolderPath, missingFlightID, folderName);
    if (!fs.existsSync(targetFolderSinglePath)){
        fs.mkdirSync(targetFolderSinglePath);
    }

    copyDataToArchive(sourceFolderSinglePath, targetFolderSinglePath);
}

function copyDataToArchive(sourceFolderSinglePath, targetFolderSinglePath){
    copyKMLs(sourceFolderSinglePath, targetFolderSinglePath);
    copyShapes(sourceFolderSinglePath, targetFolderSinglePath);
}

function copyKMLs(sourceFolderSinglePath, targetFolderSinglePath){
    let kmlFiles = glob.sync('**/*.kml', {cwd: sourceFolderSinglePath});

    for (let k = 0; k < kmlFiles.length; k++){
        let kmlFileSourcePath = path.join(sourceFolderSinglePath, kmlFiles[k]);
        let kmlfilename = path.parse(kmlFileSourcePath).base;

        let kmlFileTargetPath = path.join(targetFolderSinglePath, 'KMLS/KML-' + (k + 1).toString());
        if (!fs.existsSync(kmlFileTargetPath)){
            fs.mkdirSync(kmlFileTargetPath, { recursive: true });
        }

        fs.copyFileSync(kmlFileSourcePath, path.join(kmlFileTargetPath, kmlfilename));
    }
}

function copyShapes(sourceFolderSinglePath, targetFolderSinglePath){
    let shapefiles = glob.sync('**/*.shp', {cwd: sourceFolderSinglePath});

    for (let s = 0; s < shapefiles.length; s++){
        let shapefilePath = path.join(sourceFolderSinglePath, shapefiles[s]);

        let thisshapefilename = path.parse(shapefilePath).name;
        let thisshapefileDir = path.parse(shapefilePath).dir;
        // console.log(thisshapefilename, thisshapefileDir);

        let shapeFileTargetZipPath = path.join(targetFolderSinglePath, 'SHAPEFILES/SHAPEFILE-' + (s + 1).toString());
        if (!fs.existsSync(shapeFileTargetZipPath)){
            fs.mkdirSync(shapeFileTargetZipPath, { recursive: true });
        }

        let zipname = thisshapefilename + '.zip';
        let zippath = path.join(shapeFileTargetZipPath, zipname);
        // console.log(zippath);

        let zipout = fs.createWriteStream(zippath);
        let archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.pipe(zipout);

        let shapeFormats = ['.cpg', '.dbf', '.prj', '.sbn', '.sbx', '.shp', '.shx'];
        
        for (let f = 0; f < shapeFormats.length; f++){
            let shapefilenameWithFormat = thisshapefilename + shapeFormats[f];
            let foundFiles = glob.sync(shapefilenameWithFormat, {cwd: thisshapefileDir});
            if(foundFiles.length == 1){
                // console.log(foundFiles);

                let shapefilePath = path.join(thisshapefileDir, foundFiles[0]);

                archive.file(shapefilePath, { name: shapefilenameWithFormat });
            }
        }

        archive.finalize();
    }
}

function checkStringSimilarity(missingFlightID, nameToCheckAgainst){
    let numberPattern = /\d+/g;

    let numberExtracted = missingFlightID.match(numberPattern);
    let booleanArry = [];
    for (let i = 0; i < numberExtracted.length; i++){
        if(nameToCheckAgainst.includes(parseInt(numberExtracted[i]))) {
            booleanArry.push(true);
        } else {
            booleanArry.push(false);
        }
    }

    return booleanArry.every((currentValue) => currentValue == true);
}

function getAllFolderNamesInSourceWithPaths(){
    let allFolderNames = [];
    let dirs = glob.sync(path.join(sourcefolderPath, '/**/'));
    // console.log(dirs);
    
    for(let i = 0; i < dirs.length; i++){
        allFolderNames.push([path.basename(dirs[i]), dirs[i]]);
    }

    return allFolderNames;
}

function getColumnsData(cols, filePath){
    let workbook = XLSX.readFile(filePath);
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];

    let range = XLSX.utils.decode_range(worksheet['!ref']);
    let num_rows = range.e.r - range.s.r + 1;
    // let num_cols = range.e.c - range.s.c + 1;

    let colData = [];
    for (let i = 0; i < num_rows; i++){
        let rowData = [];
        for (let j = 0; j < cols.length; j++){
            let A1Notation = cols[j] + (i + 1).toString();
            let valueObj = worksheet[A1Notation];
            if (valueObj == undefined){
                rowData.push(undefined);
            } else {
                rowData.push(valueObj.v);
            }
            
        }
        colData.push(rowData);
    }

    return colData;
}

function saveXLFile(dataArry, location){
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(dataArry);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, location);
}