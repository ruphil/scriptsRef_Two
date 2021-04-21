let folderId = '1iRtXFnKmh37ytnz6UC53LLNV50odCI2O';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setTitle('FlightIDs_KMLs_Shapefiles')
                    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uploadFile(obj) {
  let parentFlightsKMLFolder = DriveApp.getFolderById(folderId);
  let blob = Utilities.newBlob(Utilities.base64Decode(obj.data), 'application/zip', obj.fileName);
  return parentFlightsKMLFolder.createFile(blob).getId();
}