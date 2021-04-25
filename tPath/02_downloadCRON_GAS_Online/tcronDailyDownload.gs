let folderID = "1UHNHdAd69BEMcurFHpKrGtT-hwFZQIt3";
let reportsDocID = "1mtoKjptJu0s0Tzkwl4x5BDN_rGqN_IgjXQ4DL8DVnjg";
let sheetID = "1jahrl-ZQnYwhCZSFXWRd7U94c7oVuY_2HOcnPEduUsA";

function tCron() {
  let sheet = SpreadsheetApp.openById(sheetID).getSheetByName("tFiles");
  
  let date = new Date();
  let dayOfMonth = pad(date.getDate(), 2);
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  let month = monthNames[date.getMonth()];
  let year = date.getFullYear();
  let dateString = year + "$" + (date.getMonth() + 1) + "$" + dayOfMonth;
  
  let url = "https://www1.nseindia.com/content/historical/EQUITIES/" + year + "/" + month + "/cm" + dayOfMonth + month + year + "bhav.csv.zip";
  let fileName = url.replace(/^.*[\\\/]/, '');
  console.log(url);
  try {
    let zipBlob = UrlFetchApp.fetch(url).getBlob();
    
    let parentFolder = DriveApp.getFolderById(folderID);
    let file = DriveApp.createFile(zipBlob).moveTo(parentFolder);
    
    let reports = DocumentApp.openById(reportsDocID);
    reports.getBody().editAsText().insertText(0, fileName + " downloaded on " + date.toLocaleString() + "\n");
    
    sheet.insertRowBefore(1).getRange(1, 1, 1, 2).setValues([[dateString, "downloaded I Suppose"]]);
  }
  catch (err) {
    sheet.insertRowBefore(1).getRange(1, 1, 1, 2).setValues([[dateString, "Weekend / Holiday"]]);
    return 0;
  }
}

function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}
