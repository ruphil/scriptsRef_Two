const {google} = require('googleapis');
const fs = require('fs');
const moment = require('moment');

const privatekey = require('../../token.json');
let basePath = "D:/jData/";

let jwtClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
);

const folderID_AllDownloaded = "1UHNHdAd69BEMcurFHpKrGtT-hwFZQIt3";

var currentFolderID = folderID_AllDownloaded;

var fileNames = [];
var nextPgToken = '';

function getFilesListNCheckSheet(nextPgToken){
    google.drive('v3').files.list({
        auth: jwtClient,
        q: `'${currentFolderID}' in parents`,
        fields: 'nextPageToken, files(id, name)',
        pageSize: 1000,
        pageToken: nextPgToken,
        spaces: 'drive'
        }, function (_, response) {
            var responseFiles = response.data.files
            // console.log("Response Files Length: ", responseFiles.length)
            
            fileNames.push(...responseFiles)
            // console.log("Current FileNames Length: ", fileNames.length)

            var nextPgToken = response.data.nextPageToken
            // console.log("Next Page Token: ", nextPgToken)

            if (nextPgToken != undefined){
                getFilesListNCheckSheet(nextPgToken)
            } else {
                tFilesMakeSheet(fileNames)
            }
        }
    );
}

getFilesListNCheckSheet(nextPgToken);

let tFilesDir = []
function tFilesMakeSheet(fileNames){
    for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i];
        tFilesDir.push(fileName.name);
    }
    // console.log(tFilesDir);
    okNowMakeCSV();
}


let startDate = moment();
let endDate = moment();
function okNowMakeCSV(){
    for (let i = 0; i < tFilesDir.length; i++) {
        const tFile = tFilesDir[i];
        let momentDate = moment(tFile.substring(2,11), "DDMMMYYYY");
        if(momentDate.unix() < startDate.unix()){
            startDate = momentDate;
        }
    
        if (momentDate.unix() > endDate.unix()){
            endDate = momentDate;
        }
    }
    
    // console.log(startDate, endDate);
    let currentDate = startDate;
    
    let filesData = "";
    while(currentDate.unix() <= endDate.unix()){
        // console.log(currentDate);
    
        let fileName = currentDate.format("[cm]DD");
        fileName += currentDate.format("MMM").toUpperCase();
        fileName += currentDate.format("YYYY[bhav.csv.zip]");
    
        let whetherFileExist = tFilesDir.includes(fileName);
        let currentDateStr = currentDate.format("YYYY$MM$DD");
        let message = (whetherFileExist) ? "downloaded I Suppose" : "Weekend / Holiday";
        // console.log(currentDateStr, message);
    
        filesData = currentDateStr + "," + message + "\n" + filesData;
    
        currentDate.add(1, 'day');
    }

    fs.writeFileSync(basePath + 'tFiles.csv', filesData);
    console.log("done");
}


