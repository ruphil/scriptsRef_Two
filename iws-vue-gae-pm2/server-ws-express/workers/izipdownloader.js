const { parentPort, workerData } = require('worker_threads');
const moment = require('moment');
const path = require('path');
const axios = require('axios').default;
const sqlite3 = require('sqlite3').verbose();
// const { writeFile } = require('fs');

let yearGlobal = workerData.year;
let enddate = workerData.enddate;

let zipDBPath = `D:/Databases/iZips/iZip${yearGlobal}.db`;
let zipdb = new sqlite3.Database(zipDBPath, (err) => {
    if (err) {
        console.log(err.message);
        return 0;
    } else {
        let createTableQuery = `CREATE TABLE IF NOT EXISTS ziptable${yearGlobal}(
            DATE INTEGER NOT NULL,
            MONTH INTEGER NOT NULL,
            YEAR INTEGER NOT NULL,
            FULLDATE TEXT NOT NULL PRIMARY KEY,
            ZIPDATA TEXT NOT NULL
        );`;

        zipdb.exec(createTableQuery, (err)=>{
            if (err){
                console.log(err.message);
                return 0;
            }
        });
    }
});

let currentDateObj = moment(`${yearGlobal}-01-01`, 'YYYY-MM-DD');
let endDateObj = moment(enddate, 'YYYY-MM-DD');

const downloaderInterval = setInterval(() => {
    let day = currentDateObj.day();
    if(day != 0 && day != 6){
        let formatStr = `[https://icontentdelivery.appspot.com/?date=]YYYY-MM-DD`;
        let formattedURL = currentDateObj.format(formatStr);
        let date = currentDateObj.date();
        let month = currentDateObj.month();
        let year = currentDateObj.year();
        let fulldate = currentDateObj.format('YYYY-MM-DD');

        let downloadObj = {
            formattedURL,
            date, month, year, fulldate
        };

        downloadNSaveToDrive(downloadObj);
    }
    
    if(currentDateObj.isAfter(endDateObj)){
        clearInterval(downloaderInterval);
    }

    currentDateObj.add(1, 'day');
}, 2000);

const downloadNSaveToDrive = async (downloadObj) => {
    let { formattedURL } = downloadObj;

    axios.get(formattedURL, { responseType: 'arraybuffer' })
    .then(res => {
        console.log(res.status);
        setTimeout(() => {
            createDBandSaveData(res.data, downloadObj);    
        }, 100);
    })
    .catch(err => {
        let errmsg = err.message;
        parentPort.postMessage(`Could Not Download URL: ${formattedURL} > ${errmsg}`);
    });
}

const createDBandSaveData = (arrybuff, downloadObj) => {
    let { formattedURL, date, month, year, fulldate } = downloadObj;
    let zipbase64 = Buffer.from(arrybuff).toString('base64');
    
    let insertQuery = `INSERT INTO ziptable${year} (DATE, MONTH, YEAR, FULLDATE, ZIPDATA) VALUES (?,?,?,?,?)`;
    let insertData = [date, month, year, fulldate, zipbase64];
    zipdb.run(insertQuery, insertData, function(err) {
        if (err) {
            parentPort.postMessage(err.message);
            parentPort.postMessage(`Could Not Save URL: ${formattedURL}`);
        } else {
            parentPort.postMessage(`Saved URL: ${formattedURL}`);
        }
    });
}