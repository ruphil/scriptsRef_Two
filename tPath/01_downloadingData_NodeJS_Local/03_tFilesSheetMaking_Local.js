const fs = require('fs');
const moment = require('moment');

let basePath = "D:/jData/";
let tFilesPath = basePath + "tFiles/";

let tFilesDir = fs.readdirSync(tFilesPath);
let startDate = moment();
let endDate = moment();
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

    let fileName = currentDate.format("[/cm]DD");
    fileName += currentDate.format("MMM").toUpperCase();
    fileName += currentDate.format("YYYY[bhav.csv.zip]");
    let filePath = tFilesPath + fileName;

    let whetherFileExist = fs.existsSync(filePath);
    let currentDateStr = currentDate.format("YYYY$MM$DD");
    let message = (whetherFileExist) ? "downloaded I Suppose" : "Weekend / Holiday";
    // console.log(currentDateStr, message);

    filesData = currentDateStr + "," + message + "\n" + filesData;

    currentDate.add(1, 'day');
}

fs.writeFileSync(basePath + 'tFiles.csv', filesData);