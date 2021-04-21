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
    socket.on('load_nav', function(data){
        load_nav(socket, data);
    });

    socket.on('load_content', function(data){
        load_content(socket, data);
    });

    socket.on('check_UserLogin', function(data){
        check_UserLogin(socket, data);
    });

    socket.on('check_MailID_Exists', function(user){
        check_MailID_Exists(socket, user);
    });

    socket.on('register_User', function(userDetails){
        register_User(socket, userDetails);
    });

    socket.on('getBasicData', function(){
        getBasicDataForSite(socket);
    });

    socket.on('loadSvamitvaVillagesDataFromServer', function(){
        loadSvamitvaVillagesDataFromServer(socket);
    })

    socket.on('loadUserDetails', function(data){
        loadUserDetails(socket, data);
    });

    socket.on('checkUserNPutActivityData', function(data){
        checkUserNPutActivityData(socket, data);
    });

    socket.on('checkUserNPutFlightData', function(data){
        checkUserNPutFlightData(socket, data);
    });
    
    socket.on('getFlightsForEditing', function(data){
        checkUserNGetFlightsForEditing(socket, data);
    });

    socket.on('toggleDeletionMarked', function(data){
        checkUserNToggleDeletionMarked(socket, data);
    });

    socket.on('checkUserNPutDroneManagementData', function(data){
        checkUserNPutDroneManagementData(socket, data);
    });

    // template_content_direct Socket Handlers  -------------------------------------------------------------------------

    socket.on('generateReportDateWise', function(data){
        generateReportDateWise(socket, data);
    });
}

// Socker Helper Functions -------------------------------------------------------------------------------------

function loadLoginPage(socket){
    let template_nav = fs.readFileSync(__dirname + '/templates_nav/login_register.html', 'utf-8');
    socket.emit('handle_nav', template_nav);
    socket.emit('handle_content', '');
}

function load_nav(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];

    // console.log(data);
    if(username != undefined && password != undefined && userRole != undefined){
        checkUserNLoadNav(socket, data);
    } else {
        loadLoginPage(socket);
    }
}

function checkUserNLoadNav(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];

    google.sheets('v4').spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: user_roles_ID,
            range: 'users!A2:F'
        }, function (err, response) {
            // console.log(err);
            let responseValues = response.data.values;

            let userValid = false;
            for (let i = 0; i < responseValues.length; i++){
                let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';
                if(cond){
                    userValid = true;
                }
            }
            
            if(userValid){
                handleUserNav(socket, userRole);
            } else {
                loadLoginPage(socket);
            }
    });
}

function handleUserNav(socket, userRole){
    let template_nav = fs.readFileSync(__dirname + '/templates_nav/' + userRole + '.html', 'utf-8');
    socket.emit('handle_nav', template_nav);
}

//  -----------------------------------------------------------------------------------------------------------

function load_content(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];

    // console.log(data);
    if(username != undefined && password != undefined && userRole != undefined){
        checkUserNLoadContent(socket, data);
    } else {
        loadLoginPage(socket);
    }
}

function checkUserNLoadContent(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];
    let roleSection = data[3];

    google.sheets('v4').spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: user_roles_ID,
            range: 'users!A2:F'
        }, function (err, response) {
            // console.log(err);
            let responseValues = response.data.values;

            let userValid = false;
            for (let i = 0; i < responseValues.length; i++){
                let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';
                if(cond){
                    userValid = true;
                }
            }
            
            if(userValid){
                handleUserContent(socket, roleSection);
            } else {
                loadLoginPage(socket);
            }
    });
}

function handleUserContent(socket, roleSection){
    let template_nav = fs.readFileSync(__dirname + '/templates_content/' + roleSection + '.html', 'utf-8');
    socket.emit('handle_content', template_nav);
}

//  -----------------------------------------------------------------------------------------------------------

function check_UserLogin(socket, data){
    let username = data[0];
    let password = data[1];

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        if(!err){
            let responseValues = response.data.values;
            // console.log(responseValues);

            let approved = false;
            let userValid = false;
            let userRole = "null";
            for (let i = 0; i < responseValues.length; i++){
                let cond1 = username == responseValues[i][0] && password == responseValues[i][1];
                let cond2 = cond1 && responseValues[i][5] == 'yes';

                if(cond2){
                    userRole = responseValues[i][4];
                    userValid = true;
                    approved = true;
                    break;
                } else if (cond1){
                    userRole = responseValues[i][4];
                    userValid = true;
                    approved = false;
                    break;
                }
            }

            if(approved){
                socket.emit('userloginInfo', ['approved', [username, password, userRole]]);
            } else if (userValid){
                socket.emit('userloginInfo', ['userValid', [username, password, userRole]]);
            } else {
                socket.emit('userloginInfo', ['invalid']);
            }
        } else {
            socket.emit('userloginInfo', ['servererror']);
        }
        
    });
}

//  -----------------------------------------------------------------------------------------------------------

function check_MailID_Exists(socket, username){
    console.log('Checking If User Exists');
    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let userAvailable = false;
        for (let i = 0; i < responseValues.length; i++){
            let postCond = username == responseValues[i][0];
            if(postCond){
                userAvailable = true;
            }
        }
        
        if(userAvailable){
            socket.emit('userExistsInfo', 'available');
        } else {
            socket.emit('userExistsInfo', 'notavailable');
        }
    });
}

function register_User(socket, userDetails){
    console.log('Registering Users');

    userDetails.push('pilot_role');
    userDetails.push('no');

    let resource = {
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A:F',
        valueInputOption: 'RAW',
        resource:{
            values: [userDetails]
        }
    }
    
    google.sheets('v4').spreadsheets.values.append(resource, function (err, _){
        // console.log(err);
        if(!err){
            socket.emit('registrationInfo', 'success');
        } else {
            socket.emit('registrationInfo', 'failure');
        }
    });
}

//  -----------------------------------------------------------------------------------------------------------

function getBasicDataForSite(socket){
    let ranges = ['drones!A2:A100', 'fieldpersonnel!A2:A100', 'taluks!A2:B250'];
    google.sheets('v4').spreadsheets.values.batchGet({
            auth: jwtClient,
            spreadsheetId: data_sheet_ID,
            ranges: ranges
        }, function (err, response) {
            // console.log(err);
            // console.log(response);
            socket.emit('basicData', response.data.valueRanges);
    });
}

function loadSvamitvaVillagesDataFromServer(socket){
    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: data_sheet_ID,
        range: 'villages!A2:D'
        // range: 'villages!A2:D100'
    }, function (err, response) {
        socket.emit('svamitvaVillagesData', response.data.values);
    });
}

//  -----------------------------------------------------------------------------------------------------------

function loadUserDetails(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let userValid = false;
        let name = "";
        let mobiel = "";
        for (let i = 0; i < responseValues.length; i++){
            let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';

            if(cond){
                userValid = true;
                name = responseValues[i][2];
                mobile = responseValues[i][3];
                break;
            }
        }
        
        if(userValid){
            sendUserDetails(socket, [username, name, mobile, userRole]);
        } else {
            loadLoginPage(socket);
        }
    });
}

function sendUserDetails(socket, values){
    socket.emit('handleUserDetails', values);
}

//  -----------------------------------------------------------------------------------------------------------

function checkUserNPutActivityData(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];
    let uploadValues = data[3];

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let userValid = false;
        for (let i = 0; i < responseValues.length; i++){
            let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';
            if(cond){
                userValid = true;
            }
        }
        
        if(userValid){
            uploadValues.unshift(getFormattedDate());
            uploadValues.push(username);
            // console.log(uploadValues);
            putActivityData(socket, uploadValues);
        } else {
            loadLoginPage(socket);
        }
    });
}

function getFormattedDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function putActivityData(socket, values){ 
    let resource = {
        auth: jwtClient,
        spreadsheetId: activities_ID,
        range: 'activities!A:L',
        valueInputOption: 'RAW',
        resource:{
            values: [values]
        }
    }
    
    google.sheets('v4').spreadsheets.values.append(resource, function (err, _){
        console.log(err);
        if(!err){
            socket.emit('activityMsg', 'success');
        } else {
            socket.emit('activityMsg', 'failure');
        }
    })
}

//  -----------------------------------------------------------------------------------------------------------

function checkUserNPutFlightData(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];
    let uploadValues = data[3];
    let rowIndex = data[4];

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let userValid = false;
        for (let i = 0; i < responseValues.length; i++){
            let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';
            if(cond){
                userValid = true;
            }
        }
        
        if(userValid){
            uploadValues.push(username);
            uploadValues.unshift('No');
            uploadValues.unshift(getFormattedDate());
            // console.log(uploadValues);

            let mappedValues = uploadValues.map(function(val){
                if(val == ""){
                    return "-";
                } else {
                    return val;
                }
            });

            if(rowIndex != ''){
                checkMethodNPutFlightData(socket, [mappedValues, rowIndex]);
            } else {
                appendFlightData(socket, mappedValues);
            }
            
        } else {
            loadLoginPage(socket);
        }
    });
}

function checkMethodNPutFlightData(socket, data){
    let uploadValues = data[0];
    let rowIndex = data[1];
    let flightID = uploadValues[2];

    let rangeConstructed = `flight_logs!C${rowIndex}`;

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: flight_log_ID,
        range: rangeConstructed
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;
        let responseRow = responseValues[0];

        console.log(flightID, responseRow[0]);
        if (flightID == responseRow[0]){
            updateFlightData(socket, [rowIndex, uploadValues]);
        } else {
            appendFlightData(socket, uploadValues);
        }
    });
}

function updateFlightData(socket, data){
    let rowIndex = data[0];
    let uploadValues = data[1];

    let values = [uploadValues];
    let rangeConstructed = `flight_logs!A${rowIndex}:BD${rowIndex}`;

    const resource = {
        values
    };
    let valueInputOption = 'RAW';
    google.sheets('v4').spreadsheets.values.update({
        auth: jwtClient,
        spreadsheetId: flight_log_ID,
        range: rangeConstructed,
        valueInputOption: valueInputOption,
        resource: resource,
    }, function(err, response){
        if(!err){
            socket.emit('flightStatusMsg', 'success');
        } else {
            socket.emit('flightStatusMsg', 'failure');
        }
    });
}

function appendFlightData(socket, uploadValues){
    let resource = {
        auth: jwtClient,
        spreadsheetId: flight_log_ID,
        range: 'flight_logs!A:BD',
        valueInputOption: 'RAW',
        resource:{
            values: [uploadValues]
        }
    }
    
    google.sheets('v4').spreadsheets.values.append(resource, function (err, _){
        // console.log(err);
        if(!err){
            socket.emit('flightStatusMsg', 'success');
        } else {
            socket.emit('flightStatusMsg', 'failure');
        }
    });
}

//  -----------------------------------------------------------------------------------------------------------

function checkUserNGetFlightsForEditing(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let userValid = false;
        for (let i = 0; i < responseValues.length; i++){
            let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';
            if(cond){
                userValid = true;
            }
        }
        
        if(userValid){
            getFlightsForEditing(socket, username);
        } else {
            socket.emit('handleSearchedFlightsForEditing', ['nodata']);
        }
    });
}

function getFlightsForEditing(socket, username){
    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: flight_log_ID,
        range: 'flight_logs!BD2:BD'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let rangePreStr = 'flight_logs!A';
        let endColumn = 'BD';
        let buildUserRanges = buildRangesWithUser(responseValues, username, rangePreStr, endColumn);
        getFlightsForEditingBuildRanges(socket, buildUserRanges);
    });
}

function getFlightsForEditingBuildRanges(socket, buildUserRanges){
    google.sheets('v4').spreadsheets.values.batchGet({
            auth: jwtClient,
            spreadsheetId: flight_log_ID,
            ranges: buildUserRanges
        }, function (err, response) {
            // console.log(err);
            // console.log(response);
            let flightValueUserRanges = response.data.valueRanges;
            console.log(flightValueUserRanges);

            let flightResponseUserValues = [];
            for (let i = 0; i < flightValueUserRanges.length; i++){
                let flightRangeValues = flightValueUserRanges[i].values;
                let flightRangeStartIndex = flightValueUserRanges[i].range.split('!')[1];
                flightRangeStartIndex = flightRangeStartIndex.split(':')[0];
                flightRangeStartIndex = flightRangeStartIndex.replace(/[^0-9\.]/g, '');
                console.log(flightRangeStartIndex);

                for (let j = 0; j < flightRangeValues.length; j++){
                    let tempArry = flightRangeValues[j];
                    
                    tempArry.unshift(flightRangeStartIndex);
                    // console.log(tempArry);
                    flightResponseUserValues.push(tempArry);
                    flightRangeStartIndex++;
                }
            }
            // console.log(flightResponseUserValues);

            flightResponseUserValues.reverse();
            socket.emit('handleSearchedFlightsForEditing', ['data', flightResponseUserValues]);
    });
}

function buildRangesWithUser(responseValues, username, rangePreStr, endColumn){

    let buildRangesValues = [];
    let buildIndices = [];
    for (let i = 0; i < responseValues.length; i++){
        if(username == responseValues[i][0]){
            buildIndices.push(parseInt(i + 2));
        }
    }
    
    let currentItem = 0;
    let nextItem = 0;
    let itemStore = buildIndices[0];
    for (let i = 0; i < buildIndices.length; i++){
        currentItem = buildIndices[i];
        nextItem = buildIndices[i + 1];

        if (nextItem != (currentItem + 1)){
            let rangeStr = rangePreStr + itemStore + `:${endColumn}` + currentItem;
            buildRangesValues.push(rangeStr);

            itemStore = nextItem;
        }
    }

    // console.log(buildIndices);
    // console.log(buildRangesValues);
    return buildRangesValues;
}

//  -----------------------------------------------------------------------------------------------------------

function checkUserNToggleDeletionMarked(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];
    let rowIndex = data[3];
    let flightID = data[4];

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let userValid = false;
        for (let i = 0; i < responseValues.length; i++){
            let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';
            if(cond){
                userValid = true;
            }
        }
        
        if(userValid){
            determineActionForToggleDeletionMarked(socket, [rowIndex, flightID]);
        } else {
            socket.emit('handToggleDeletionMsg', 'unauthorized');
        }
    });
}

function determineActionForToggleDeletionMarked(socket, data){
    let rowIndex = data[0];
    let flightID = data[1];
    
    let rangeConstructed = `flight_logs!B${rowIndex}:C${rowIndex}`;

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: flight_log_ID,
        range: rangeConstructed
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;
        let reponseRow = responseValues[0];

        if (flightID == reponseRow[1]){
            let markedForDeletion = reponseRow[0];

            let updatedMark = ''
            if(markedForDeletion == 'Yes'){
                updatedMark = 'No';
            } else {
                updatedMark = 'Yes';
            }

            toggleDeletionMarked(socket, [rowIndex, updatedMark]);
        } else {
            socket.emit('handToggleDeletionMsg', 'invalidrequest');
        }
    });
}

function toggleDeletionMarked(socket, data){
    let rowIndex = data[0];
    let updatedMark = data[1];

    let values = [[updatedMark]];
    let rangeConstructed = `flight_logs!B${rowIndex}`;

    const resource = {
        values
    };
    let valueInputOption = 'RAW';
    google.sheets('v4').spreadsheets.values.update({
        auth: jwtClient,
        spreadsheetId: flight_log_ID,
        range: rangeConstructed,
        valueInputOption: valueInputOption,
        resource: resource,
    }, function(err, response){
        if(!err){
            socket.emit('handToggleDeletionMsg', 'success');
        } else {
            socket.emit('handToggleDeletionMsg', 'servererror');
        }
    });
}

//  --------------------------------------------------------------------------------------

function checkUserNPutDroneManagementData(socket, data){
    let username = data[0];
    let password = data[1];
    let userRole = data[2];
    let uploadValues = data[3];

    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: user_roles_ID,
        range: 'users!A2:F'
    }, function (err, response) {
        // console.log(err);
        let responseValues = response.data.values;

        let userValid = false;
        for (let i = 0; i < responseValues.length; i++){
            let cond = username == responseValues[i][0] && password == responseValues[i][1] && userRole == responseValues[i][4] && responseValues[i][5] == 'yes';
            if(cond){
                userValid = true;
            }
        }
        
        if(userValid){
            putDroneManagementData(socket, uploadValues);
        } else {
            loadLoginPage(socket);
        }
    });
}

function putDroneManagementData(socket, values){ 
    let resource = {
        auth: jwtClient,
        spreadsheetId: drone_history_ID,
        range: 'dronesstatus!A:D',
        valueInputOption: 'RAW',
        resource:{
            values: [values]
        }
    }
    
    google.sheets('v4').spreadsheets.values.append(resource, function (err, _){
        console.log(err);
        if(!err){
            socket.emit('droneDataMgmtMsg', 'success');
        } else {
            socket.emit('droneDataMgmtMsg', 'failure');
        }
    })
}

//  -----------------------------------------------------------------------------------------------------------
//  Socket Template Content Direct  ---------------------------------------------------------------------------------------------
//  Report Generators   -----------------------------------------------------------------------------------------

function getFlightsNActivitiesForMonthlyReportGeneration(socket, buildFlightRanges, buildActivityRanges, startDateStr, endDateStr){
    buildFlightRanges.unshift('flight_logs!A1:BB1');
    google.sheets('v4').spreadsheets.values.batchGet({
            auth: jwtClient,
            spreadsheetId: flight_log_ID,
            ranges: buildFlightRanges
        }, function (err, response) {
            // console.log(err);
            // console.log(response);
            let flightValueRanges = response.data.valueRanges;
            // console.log(flightValueRanges);

            let flightResponseValues = [];
            for (let i = 0; i < flightValueRanges.length; i++){
                let flightRangeValues = flightValueRanges[i].values;
                // console.log(flightRangeValues);

                for (let j = 0; j < flightRangeValues.length; j++){
                    flightResponseValues.push(flightRangeValues[j]);
                }
            }

            // console.log(flightResponseValues);
            
            // Maintaining 2 Dimensions
            let flightHeaderValues = [flightResponseValues[0]];

            // Filter based on Marked for Deletion
            let deletionFilteredFlightResponseValues = flightResponseValues.slice(1).filter(function(row, index){
                if(row[1] == 'No'){
                    return row
                }
            });

            let concatFlightResponseValues = flightHeaderValues.concat(deletionFilteredFlightResponseValues);

            appendActivitiesForMonthlyReportGeneration(socket, buildActivityRanges, concatFlightResponseValues, startDateStr, endDateStr);

    });
}

function appendActivitiesForMonthlyReportGeneration(socket, buildActivityRanges, flightResponseValues, startDateStr, endDateStr){
    let prefixFlightCols = ['E', 'F', 'P', 'Q', 'L', 'M', 'O', 'D']; 
    let flightFlightCols = ['C', 'I', 'G', 'H', 'J', 'N', 'K', 'R', 'S', 'BA'];
    let suffixFlightCols = ['BB'];

    let allFlightCols = prefixFlightCols.concat(flightFlightCols).concat(suffixFlightCols);

    // Getting Headings
    let headerFlightRow = flightResponseValues[0];

    let prefixFlightIndices = prefixFlightCols.map(sheetsColumnMapper);
    let flightFlightIndices = flightFlightCols.map(sheetsColumnMapper);
    let suffixFlightIndices = suffixFlightCols.map(sheetsColumnMapper);

    // Extracting Values
    let prefixFlightHeadings = getHeaderValues(headerFlightRow, prefixFlightIndices);
    let flightFlightHeadings = getHeaderValues(headerFlightRow, flightFlightIndices);
    let suffixFlightHeadings = getHeaderValues(headerFlightRow, suffixFlightIndices);

    let allColFlightIndices = allFlightCols.map(sheetsColumnMapper);
    let rowsFlightValues = flightResponseValues.slice(1).map(extractSelectedValues(allColFlightIndices));

    buildActivityRanges.unshift('activities!A1:K1');
    google.sheets('v4').spreadsheets.values.batchGet({
            auth: jwtClient,
            spreadsheetId: activities_ID,
            ranges: buildActivityRanges
        }, function (err, response) {
            // console.log(err);
            // console.log(response);
            let activityValueRanges = response.data.valueRanges;
            // console.log(flightValueRanges);

            let activityResponseValues = [];
            for (let i = 0; i < activityValueRanges.length; i++){
                let activityRangeValues = activityValueRanges[i].values;
                // console.log(flightRangeValues);

                for (let j = 0; j < activityRangeValues.length; j++){
                    activityResponseValues.push(activityRangeValues[j]);
                }
            }

            // console.log(activityResponseValues);

            let colsActivitiesOrder = ['C', 'D', 'G', 'H', 'E', 'F', 'K', 'B', 'I', 'J'];
            let allColActivitiesIndices = colsActivitiesOrder.map(sheetsColumnMapper);
            let rowsActivityValues = activityResponseValues.slice(1).map(extractSelectedValues(allColActivitiesIndices));

            // Concating Flight and Activity Rows
            let rowsValuesConcat = rowsFlightValues.concat(rowsActivityValues);

            // And Sorting Row Values
            rowsValuesConcat.sort(sortFunction(3));
            rowsValuesConcat.sort(sortFunction(2));
            rowsValuesConcat.sort(sortFunction(1));
            rowsValuesConcat.sort(sortFunction(0));

            // Table Generation

            let reportPeriod = 'From ' + startDateStr + ' To ' + endDateStr;

            let fn = pug.compileFile('./templates_pug/monthlyReports.pug');
            let html = fn({
                reportPeriod: reportPeriod,
                prefixHeadings: prefixFlightHeadings,
                flightHeadings: flightFlightHeadings,
                suffixHeadings: suffixFlightHeadings,
                rowsValues: rowsValuesConcat
            });

            socket.emit('handleReportGeneration', html);

    });
}

function sheetsColumnMapper(val) {
    let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;
    for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
    }
    return result - 1;
}

function getHeaderValues(headerRow, indices){
    let headings = [];
    for(let i = 0; i < indices.length; i++){
        headings.push(headerRow[indices[i]]);
    }
    return headings;
}

function extractSelectedValues(indices) {
    return function(row) { 
        let extractedRow = [];
        for(let i = 0; i < indices.length; i++){
            extractedRow.push(row[indices[i]]);
        }
        return extractedRow;
    };
}

function sortFunction(colIndex) {
    return function (a, b) {
        if (a[colIndex] === b[colIndex]) {
            return 0;
        } else {
            return (a[colIndex] < b[colIndex]) ? -1 : 1;
        }
    }
}

function  generateReportDateWise(socket, data){
    let startDate = data[0];
    let endDate = data[1];
    // console.log(startDate, endDate);

    getFlightRanges(socket, startDate, endDate);
}

function getFlightRanges(socket, startDateStr, endDateStr){
    let range = 'flight_logs!E2:E';
    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: flight_log_ID,
        range: range
    }, function (err, response) {
        if(!err){
            let responseValues = response.data.values;
            let rangePreStr = `flight_logs!A`;
            let endColumn = "BB";
            let buildFlightRanges = buildRangesWithDate(responseValues, startDateStr, endDateStr, rangePreStr, endColumn);
            // console.log(buildFlightRanges);

            getActivityRanges(socket, startDateStr, endDateStr, buildFlightRanges);
        } else {
            console.log(err);
        }
    });
}

function getActivityRanges(socket, startDateStr, endDateStr, buildFlightRanges){
    let range = 'activities!C2:C';
    google.sheets('v4').spreadsheets.values.get({
        auth: jwtClient,
        spreadsheetId: activities_ID,
        range: range
    }, function (err, response) {
        if(!err){
            let responseValues = response.data.values;
            let rangePreStr = `activities!A`;
            let endColumn = "K";
            let buildActivityRanges = buildRangesWithDate(responseValues, startDateStr, endDateStr, rangePreStr, endColumn);
            // console.log(buildFlightRanges);
            // console.log(buildActivityRanges);

            getFlightsNActivitiesForMonthlyReportGeneration(socket, buildFlightRanges, buildActivityRanges, startDateStr, endDateStr);
        } else {
            console.log(err);
        }
    });
}

function buildRangesWithDate(responseValues, startDateStr, endDateStr, rangePreStr, endColumn){
    let startDate = makeDate(startDateStr);
    let endDate = makeDate(endDateStr);
    // console.log(responseValues, startDate, endDate);

    let buildRangesValues = [];
    let buildIndices = [];
    for (let i = 0; i < responseValues.length; i++){
        let currentDate = makeDate(responseValues[i][0]);
        
        if(startDate.getTime() <= currentDate.getTime() && currentDate.getTime() <= endDate.getTime()){
            // console.log(startDate, endDate, currentDate, startDate.getTime(), endDate.getTime(), currentDate.getTime(), i+2);
            buildIndices.push(parseInt(i + 2));
        }
    }
    
    let currentItem = 0;
    let nextItem = 0;
    let itemStore = buildIndices[0];
    for (let i = 0; i < buildIndices.length; i++){
        currentItem = buildIndices[i];
        nextItem = buildIndices[i + 1];

        if (nextItem != (currentItem + 1)){
            let rangeStr = rangePreStr + itemStore + `:${endColumn}` + currentItem;
            buildRangesValues.push(rangeStr);

            itemStore = nextItem;
        }
    }

    // console.log(buildIndices);
    // console.log(buildRangesValues);
    return buildRangesValues;
}

function makeDate(dateStr){
    let dateStrParts = dateStr.split('-');
    return new Date(dateStrParts[0], parseInt(dateStrParts[1]) - 1, dateStrParts[2], 12, 0, 0);
}

module.exports = {
    handleSocket
}