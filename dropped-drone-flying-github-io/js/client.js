
var CLIENT_ID = '156381483719-4k93fjb1h13lo946e2l3fchrni6gckf5.apps.googleusercontent.com';
var API_KEY = 'AIzaSyA8At9n2NlVSzCxmw2GRcpkxyfQ2u6KgEc';
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

uploadData.onclick = handleClientLoad;

var authorizeButton = document.getElementById('authorize_button');
      var signoutButton = document.getElementById('signout_button');


function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// function initClient() {
//     gapi.client.init({
//       apiKey: API_KEY,
//       clientId: CLIENT_ID,
//       discoveryDocs: DISCOVERY_DOCS,
//       scope: SCOPES
//     }).then(function () {
//       // Listen for sign-in state changes.
//       gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

//       // Handle the initial sign-in state.
//       updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
//       authorizeButton.onclick = handleAuthClick;
//       signoutButton.onclick = handleSignoutClick;
//     }, function(error) {
//       appendPre(JSON.stringify(error, null, 2));
//     });
//   }

//   /**
//    *  Called when the signed in status changes, to update the UI
//    *  appropriately. After a sign-in, the API is called.
//    */
//   function updateSigninStatus(isSignedIn) {
//     if (isSignedIn) {
//       authorizeButton.style.display = 'none';
//       signoutButton.style.display = 'block';
//       writeCells();
//     } else {
//       authorizeButton.style.display = 'block';
//       signoutButton.style.display = 'none';
//     }
//   }

//   /**
//    *  Sign in the user upon button click.
//    */
//   function handleAuthClick(event) {
//     gapi.auth2.getAuthInstance().signIn();
//   }

//   /**
//    *  Sign out the user upon button click.
//    */
//   function handleSignoutClick(event) {
//     gapi.auth2.getAuthInstance().signOut();
//   }

//   /**
//    * Append a pre element to the body containing the given message
//    * as its text node. Used to display the results of the API call.
//    *
//    * @param {string} message Text to be placed in pre element.
//    */
//   function appendPre(message) {
//     var pre = document.getElementById('content');
//     var textContent = document.createTextNode(message + '\n');
//     pre.appendChild(textContent);
//   }

  /**
   * Print the names and majors of students in a sample spreadsheet:
   * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   */

function initClient(){
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      console.log('came here');

      listMajors();
      writeCells();

    }, function(error) {
      appendPre(JSON.stringify(error, null, 2));
    });
}

function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function listMajors() {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1tZlUpHJZ-HSVcK1EGzpepIQHjmBZj3brKrwINMAiWzY',
      range: 'Sheet1!A1:A',
    }).then(function(response) {
      var range = response.result;

      var row = range.values[0];
      console.log(row);
      
    }, function(response) {
      appendPre('Error: ' + response.result.error.message);
    });
}

function writeCells(){
    var values = [
        [
          2, 3, 4
        ],
      ];
      var body = {
        values: values
      };
      gapi.client.sheets.spreadsheets.values.update({
         spreadsheetId: '1tZlUpHJZ-HSVcK1EGzpepIQHjmBZj3brKrwINMAiWzY',
         range: 'Sheet1!A2:C',
         valueInputOption: 'RAW',
         resource: body
      }).then((response) => {
        var result = response.result;
        console.log(`${result.updatedCells} cells updated.`);
      });
}