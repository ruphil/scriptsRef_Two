function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setTitle('Compiled_Reports')
                    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

let sheet1 = '1VToX1IZi-aA9DrXCTz9kMFkOMsmddFloDC0PsOdTeoM';
let sheet2 = '1TZFi3_2h0TOHIPgY_PjV7xUTPnHlJ00bvv-tN-Qy_bw';

function getCompiledReport(){
  let headingRow = SpreadsheetApp.openById(sheet1).getSheetByName('TrinityF90+00218').getRange(1, 2, 1, 42).getValues();

  let allSpreadsheetData = new Array();
  allSpreadsheetData.push(headingRow[0]);

  // allSpreadsheetData = allSpreadsheetData.concat(getDataFromSheetID(sheet1));
  allSpreadsheetData = allSpreadsheetData.concat(getDataFromSheetID(sheet2));

  return allSpreadsheetData;
}

function getDataFromSheetID(sheetID){
  let ss = SpreadsheetApp.openById(sheetID);
  let sheetsObj = ss.getSheets();

  let sheetsToIgnore = ['Drone-Flying-Summary'];

  let allSheetData = new Array();
  for (var i = 0 ; i < sheetsObj.length ; i++){
    let sheetName = sheetsObj[i].getName();

    if (!sheetsToIgnore.includes(sheetName)){
      let droneDetailsSheetWise = fetchSheetData(sheetName);
      allSheetData = allSheetData.concat(droneDetailsSheetWise);

      // if(i == 2){
      //   break;
      // }
    }
  }

  return allSheetData;
}

function fetchSheetData(droneSheet){
  let ss = SpreadsheetApp.openById(sheet1);
  let sheet = ss.getSheetByName(droneSheet);

  let lastRow = sheet.getLastRow();
  
  let flightIDColumn = 3;
  let startRow = 2;

  let flightIDs = sheet.getRange(startRow, flightIDColumn, lastRow - 1, 1).getValues();

  let availRows = [];
  for (let i = 0; i < flightIDs.length; i++){
    let flightID = flightIDs[i][0];

    if (flightID != ''){
      availRows.push(startRow + i);
    }
  }

  let availRangeList = getAvailableRangeList(availRows);
  let ranges = sheet.getRangeList(availRangeList).getRanges();

  let droneDetailsSheetWise = [];
  for (let i = 0; i < ranges.length; i++){
    let displayValues = ranges[i].getDisplayValues();
    droneDetailsSheetWise = droneDetailsSheetWise.concat(displayValues);
  }
  return droneDetailsSheetWise;
}

function getAvailableRangeList(availRows){
  let rangeList = [];
  let startCol = 'B';
  let endCol = 'AQ';

  // Adding the Field Names also here
  // rangeList.push(`${startCol}1:${endCol}1`);

  for (let i = 0; i < availRows.length; i++){
    let availRow = availRows[i];
    let range = `${startCol}${availRow}:${endCol}${availRow}`;
    rangeList.push(range);
  }
  return rangeList;
}