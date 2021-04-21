const { google } = require('googleapis');
const privatekey = require('./credentials/lsmk-r-d5494b4cb17a.json');
const fs = require('fs');
const pug = require('pug');

let jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ['https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send']
);

let user_roles_ID = '1X-XiaZZU1gJRvSOZ32LEAkTBrSSLYIXAl-MVnfg8IZA';
let data_sheet_ID = '1NR9d-ZhVogcFmhTZHpNgdFLVVavmm5U-RZ8-dRy75gs';
let activities_ID = '1gyoef8g4Tc524kJlS58TliOt3hbcVqeVzFIPizrbvgw';
let flight_log_ID = '1fyWn7BeiyaIIiMj8g2ak8BaaIDuJCmCDPQ7IvMMRarU';
let drone_history_ID = '1cIZRgFA-CmESZZZTKJOuI__CAbYPeu4bc5ggfpCZPRA';

// Socket Handler -----------------------------------------------------------------------------------------------------

function handleSocket(socket){
    socket.on('getRowsSheetDataWithGeoJSON', function(data){
        getRowsSheetDataWithGeoJSON(socket, data);
    });

    socket.on('getRowsSheetDataForOutturnReport', function(){
      getRowsSheetDataForOutturnReport(socket);
    });

    socket.on('getRowsSheetWeeklyFlightsStatus', function(){
      weeklyFlightsStatus(socket);
    });
}

// Socker Helper Functions -------------------------------------------------------------------------------------

function weeklyFlightsStatus(socket){
  let ranges = ['flight_logs!D1:S'];
  google.sheets('v4').spreadsheets.values.batchGet({
    auth: jwtClient,
    spreadsheetId: flight_log_ID,
    ranges: ranges
  }, function (err, response) {
    if(!err){
      socket.emit('handleRowsSheetWeeklyFlightsStatus', response.data.valueRanges);
    }
  });
}

function getRowsSheetDataForOutturnReport(socket){
  let ranges = ['flight_logs!D1:S'];
  google.sheets('v4').spreadsheets.values.batchGet({
    auth: jwtClient,
    spreadsheetId: flight_log_ID,
    ranges: ranges
  }, function (err, response) {
    if(!err){
      socket.emit('handleRowsSheetDataForOutturnReport', response.data.valueRanges);
    }
  });
}

function getRowsSheetDataWithGeoJSON(socket, rowsIndex){
  let rowsSplit = rowsIndex.split(',');
  let ranges = [];
  for (let i = 0; i < rowsSplit.length; i++){
      let rowIndex = rowsSplit[i];
      ranges.push(`flight_logs!A${rowIndex}:BD${rowIndex}`)
  }

  google.sheets('v4').spreadsheets.values.batchGet({
    auth: jwtClient,
    spreadsheetId: flight_log_ID,
    ranges: ranges
  }, function (err, response) {
    socket.emit('handleRowsSheetDataWithGeoJSON', response.data.valueRanges);
  });
}

module.exports = {
    handleSocket
}