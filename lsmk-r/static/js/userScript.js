// Login Modal Scripts -------------------------------------------------------------------------------
// let socket = io({transports: ['websocket']});
let socket = io();
$('document').ready(function(){
    loadNav();
});

function loadNav(){
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('load_nav', [username, password, userRole]);
}

socket.on('handle_nav', function(html){
    $('#template_navigation').html(html);

    activateMaterializeElements();
});

function activateMaterializeElements(){
    $('.modal').modal();

    $('.dropdown-trigger').dropdown({
        constrainWidth: false
    });
}

//  ----------------------------------------------------------------------------------------------------

function resetHints(){
    $('#login_hint').text('Click To Login').removeClass('red green orange');
    $('#register_hint').text('Click To Register').removeClass('red green orange');
    $('#email_hint').text('Kindly Enter Your Email Address').removeClass('red green orange');

    document.getElementById('login_form').reset();
    document.getElementById('register_form').reset();

    $('button').prop('disabled', false);
}

function login(){
    $('#login_hint').text('Please Wait...').removeClass('red green orange');

    let user = $('#email_login').val();
    let pass = $('#password_login').val();

    socket.emit('check_UserLogin', [user, pass]);
}

socket.on('userloginInfo', function(data){
    console.log(data);

    let userStatus = data[0];

    if(userStatus == 'approved'){
        $('#login_hint').text('Login Success. Refreshing.').removeClass('red green orange').addClass('green');

        setSessionStorage(data);
        loadNav();
    } else if (userStatus == 'userValid'){
        $('#login_hint').text('Yet To Be Approved').removeClass('red green orange').addClass('orange');
    } else if (userStatus == 'invalid'){
        $('#login_hint').text('Invalid Login Credentials').removeClass('red green orange').addClass('red');
    } else if (userStatus == 'servererror'){
        $('#login_hint').text('Server Error... Try Again....').removeClass('red green orange').addClass('orange');
    }
});

function setSessionStorage(data){
    let username = data[1][0];
    let password = data[1][1];
    let userRole = data[1][2];

    sessionStorage.setItem("username", username);
    sessionStorage.setItem("password", password);
    sessionStorage.setItem("userRole", userRole);
}

// Register Modal Scripts -------------------------------------------------------------------------------

let alreadyRegisteredUser = false;
let validEmail = false;

function checkMailExists(){
    $('#register_hint').text('Click To Register').removeClass('red green orange');

    let user = $('#email').val();

    if(isEmail(user)){
        socket.emit('check_MailID_Exists', user);
    } else {
        validEmail = false;
        $('#email_hint').text('Invalid Mail ID... Kindly Correct...').removeClass('red green orange').addClass('orange');
    }
}

socket.on('userExistsInfo', function(data){
    if(data == 'available'){
        alreadyRegisteredUser = true;
        validEmail = false;
        $('#email_hint').text('User Already Registered... Kindly pick a different Mail-ID...').removeClass('red green orange').addClass('orange');
    } else {
        alreadyRegisteredUser = false;
        validEmail = true;
        $('#email_hint').text('Email ID is Valid...').removeClass('red green orange').addClass('green');
    }
});

function isEmail(email) {
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function register(){
    let user = $('#email').val();
    let pass = $('#password').val();
    let repass = $('#repassword').val();
    let name = $('#name').val();
    let mobile = $('#mobile').val();

    cond = user != "" && pass != "" && repass != "" && name != "" && mobile != ""

    if(pass != repass){
        $('#register_hint').text('Passwords do not match').removeClass('red green orange').addClass('orange');
        return 0;
    }

    if(cond && !alreadyRegisteredUser && validEmail){
        console.log('Registering User');

        socket.emit('register_User', [user, pass, name, mobile]);
    } else {
        $('#register_hint').text('Kindly Check Your Data...').removeClass('red green orange').addClass('orange');
    }
}

socket.on('registrationInfo', function(data){
    if(data == 'success'){
        $('#register_hint').text('User Registered... Kindly Whatsapp Admin for Role Assignment...').removeClass('red green orange').addClass('green');

        document.getElementById('register_form').reset();
    } else if (data == 'failure'){
        $('#register_hint').text('Please Try Again').removeClass('red green orange').addClass('red');
    }
});

// Pilot Role Page Scripts  ------------------------------------------------------------------------------

function loadUserDetails(){
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('loadUserDetails', [username, password, userRole]);
}

socket.on('handleUserDetails', function(userDetails){
    // console.log(userDetails);

    $('#detailMail').text(userDetails[0]);
    $('#detailName').text(userDetails[1]);
    $('#detailMobile').text(userDetails[2]);
    $('#detailRole').text(userDetails[3]);

    $('#userDetailsModal').modal('open');
});

function loadContent(requestContent){
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('load_content', [username, password, userRole, requestContent]);
    $('#page_info').text(requestContent);
}

socket.on('handle_content', function (html){
    $('#template_content').html(html);
    
    let pageInfo = $('#page_info').text();
    let cond1 = pageInfo == 'pilot_activities' || pageInfo == 'pilot_flights';
    let cond2 = pageInfo == 'drone_management';
    if(cond1){
        do_Pilot_Stuff();
    } else if (cond2){
        do_Drone_Stuff();
    }
});

function do_Pilot_Stuff(){
    M.textareaAutoResize($('.materialize-textarea'));
    $('.materialize-textarea').characterCounter();
    setPageHeightAuto();
    
    $('.modal').modal({
        onCloseEnd: function() { // Callback for Modal close
            setPageHeightAuto();
        }
    });

    $('.fixed-action-btn').floatingActionButton();

    $("#flights-form #dronenumber,  #flights-form #uniqueQBaseFlightNo, #flights-form #flightdate, #flights-form #takeofftime, #flights-form #landingtime").change(function(e){
        setFlightIDInLabel();
    });

    getBasicData();

    // Loading Svamitva Villages

    $('#flights-form #flightcategory').change(function(){
        checkIfSvamitvaNLoadVillages();
    });
}

function do_Drone_Stuff(){
    M.textareaAutoResize($('.materialize-textarea'));
    $('.materialize-textarea').characterCounter();
    setPageHeightAuto();

    $('.chips').chips({
        placeholder: 'Drones *',
        secondaryPlaceholder: ' '
    });

    $('#drone-form #dronenumber').change(function(e){
        let selectedDrone = $("#drone-form #dronenumber option:selected").text();

        let chipDrones = M.Chips.getInstance($('#drone-form #drones'));
        chipDrones.addChip({
            tag: selectedDrone
        });

        let chipsDronesData = chipDrones.chipsData;
        let dronesValue = "";
        for (let i = 0; i < chipsDronesData.length; i++){
            if(i == chipsDronesData.length - 1){
                dronesValue += chipsDronesData[i].tag;    
            } else {
                dronesValue += chipsDronesData[i].tag + ", ";
            }
        }
        console.log(dronesValue);
    });

    getBasicData();
}

function setPageHeightAuto(){
    $('body').css({
        'min-height': '3500px',
        'overflow-y': 'auto'
    });

    setTimeout(function(){
        $('body').css({
            'min-height': $('#template_content').height(),
            'overflow-y': 'auto'
        });

        console.log($('#template_content').height());
    }, 1000);
}

function addAllDronesToChips(){
    $('#drone-form #dronenumber option').each(function(){
        let chipDrones = M.Chips.getInstance($('#drone-form #drones'));
        if ($(this).text() != 'Select Your Drone Number'){
            chipDrones.addChip({
                tag: $(this).text()
            });
        }
    });
}

function removeAllDronesFromChips() {    
    $('#drone-form #drones').html('');

    $('.chips').chips({
        placeholder: 'Drones *',
        secondaryPlaceholder: ' '
    });
}

function appendDroneMgmtData(){
    setTimeout(() => {
        $('button').prop('disabled', false);
    }, 2000);

    let droneMgmtIDs = ['drones', 'drone_event', 'eventdate', 'remarks']
    let values = getIDValues(droneMgmtIDs);
    // console.log(values);

    let valuesOK = values.every(function (elem, index) {
        return elem[1] != "";
    });

    if(valuesOK){
        let uploadValues = values.map(function(val){
            return val[1];
        });
    
        console.log(uploadValues);
        checkUserNPutDroneManagementData(uploadValues);
    } else {
        M.toast({html: 'Check Your Data Properly...'});
    }
}

function checkUserNPutDroneManagementData(uploadValues){
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('checkUserNPutDroneManagementData', [username, password, userRole, uploadValues]);
}

socket.on('droneDataMgmtMsg', function(msg){
    if(msg == 'success'){
        M.toast({html: 'Data Managed In Server Succesfully...'});

        setTimeout(() => {
            loadContent('drone_management');    
        }, 1000);
    } else {
        M.toast({html: 'Server Error...'});
    }
});

function setFlightIDInLabel(){
    let flightID_IDs = ['dronenumber', 'uniqueQBaseFlightNo', 'flightdate', 'takeofftime', 'landingtime'];

    let idValues = getIDValues(flightID_IDs);
    // console.log(idValues);

    let nullCheck = idValues.every(function (value, index) {
        return value[1] != ''
    });

    if(nullCheck){
        let actualIDValues = idValues.map(function(val){
            return val[1];
        });

        let hours = $('#landingtime').val().split(':')[0] - $('#takeofftime').val().split(':')[0];
        let minutes = $('#landingtime').val().split(':')[1] - $('#takeofftime').val().split(':')[1];

        minutes = minutes.toString().length < 2 ? '0' + minutes : minutes;
        if(minutes < 0){ 
            hours--;
            minutes = 60 + minutes;
        }

        hours = hours.toString().length < 2 ? '0' + hours : hours;

        let qBaseFlightNumber = $('#uniqueQBaseFlightNo').val();
        let flightID = actualIDValues.slice(0, 1).join("").replace(/\s/g, "") + "_" + flightNumberpad(qBaseFlightNumber, 4);

        let flightIDText = 'Flight ID: ' + flightID + ' and ';
        flightIDText += ' Flight Duration: ' + hours + ' Hours ' + minutes + ' Minutes'

        $('#flightID').text(flightIDText);
    }
}

function getBasicData(){
    socket.emit('getBasicData');
}

socket.on('basicData', function(ranges){
    handleRanges(ranges);
});

function checkIfSvamitvaNLoadVillages(){
    let idValue = getIDValues(['flightcategory']);
    let flightCatVal = idValue[0][1];
    // console.log(flightCatVal);

    if (flightCatVal == 'LSMK / Svamitva' || flightCatVal == 'Svamitva'){
        console.log('loadingSvamitvaVillagesHTML');
        loadSvamitvaVillagesHTML();
        loadSvamitvaVillagesDataFromServer();
    } else {
        loadLSMKHTML();
    }
}

function loadLSMKHTML(){
    let lsmkHTML = `
        <div class="row">
            <div class="input-field col s5">
            <input id="grampanchayat" type="text" class="validate">
            <label class="unselectable">Gram Panchayat *</label>
            </div>

            <div class="input-field col s5">
                <input id="villages" type="text" class="validate">
                <label class="unselectable">Villages Name * <span style="font-size: xx-small;">(separated by commas)</span></label>
            </div>
        </div>
    `;

    $('#lsmkorsvamitvavillages').html(lsmkHTML);
}

function loadSvamitvaVillagesHTML(){
    let SvamitvaVillagesHTML = `
        <div class="row">
            <div class="input-field col s5">
                <select id="grampanchayat">
                    <option disabled selected>Select GramPanchayat</option>
                </select>
                <label class="unselectable">Select GramPanchayat *</label>
            </div>

            <div class="input-field col s5">
                <select id="villages-loader">
                    <option disabled selected>Select Villages</option>
                </select>
                <label class="unselectable">Select Villages *</label>
            </div>
        </div>
        <div class="row">
            <div class="chips" id="villages"></div>
        </div>  
    `;

    $('#lsmkorsvamitvavillages').html(SvamitvaVillagesHTML);
    $('select').formSelect();
    $('.chips').chips({
        placeholder: 'Villages *',
        secondaryPlaceholder: ' '
    });
}

function loadSvamitvaVillagesDataFromServer(){
    socket.emit('loadSvamitvaVillagesDataFromServer');
}

socket.on('svamitvaVillagesData', function(data){
    // console.log(data);
    handleSvamitvaVillagesData(data);
});

let svamitvaVillagesData = [];
function handleSvamitvaVillagesData(data){
    svamitvaVillagesData = data;
}

let taluksData = [];
function handleRanges(ranges){
    console.log(ranges);

    let dronenumbers = ranges[0].values;
    $.each(dronenumbers, function (i, item) {
        $('#dronenumber').append($('<option>', {
            text : item[0]
        }));
    });

    let pilots = ranges[1].values
    $.each(pilots, function (i, item) {
        $('#pilot').append($('<option>', {
            text : item[0]
        }));

        $('#copilot').append($('<option>', {
            text : item[0]
        }));

        $('#missionplanner').append($('<option>', {
            text : item[0]
        }));

        $('#missionchecker').append($('<option>', {
            text : item[0]
        }));
    });

    taluksData = ranges[2].values

    let districts = taluksData.map(function(value, index) { return value[0]; });
    let uniquedistricts = districts.filter((item, i, ar) => ar.indexOf(item) === i);

    $.each(uniquedistricts, function (i, district) {
        $('#district').append($('<option>', {
            text : district
        }));
    });

    $('select').formSelect();
    $('#progress-bar').hide();
    $('#doc-content').show();

    changeFromDistrictsFunc();    
}

function changeFromDistrictsFunc(){
    $('#district').change(function(e){
        let selectedDistrict = $("#district option:selected").text();
        $('#taluk').find('option').remove().end().append('<option value="" disabled selected>Select Taluk</option>');
    
        let taluks = taluksData.map(function(value, index) { 
            if(value[0] == selectedDistrict){
                return value[1];
            }
        });

        // For removing blank values
        taluks = taluks.filter(item => item);
        //console.log(taluks);
        
        let uniquetaluk = taluks.filter((item, i, ar) => ar.indexOf(item) === i);
    
        $.each(uniquetaluk, function (i, taluk) {
            $('#taluk').append($('<option>', {
                text : taluk
            }));
        });
    
        $('#taluk').formSelect();

        handleSvamitvaGPsIfExists();
    });
}

function handleSvamitvaGPsIfExists(){
    if($('#grampanchayat').prop('type') == 'select-one'){
        let selectedDistrict = $("#district option:selected").text();
        selectedDistrict = selectedDistrict.toUpperCase();
        console.log(selectedDistrict);
    
        $('#grampanchayat').find('option').remove().end().append('<option value="" disabled selected>Select GramPanchayat</option>');

        let grampanchayats = svamitvaVillagesData.map(function(value, index) { 
            if(value[0] == selectedDistrict){
                return value[1];
            }
        });

        // For removing blanks
        grampanchayats = grampanchayats.filter(item => item);

        let uniquegp = grampanchayats.filter((item, i, ar) => ar.indexOf(item) === i);

        $.each(uniquegp, function (i, gp) {
            $('#grampanchayat').append($('<option>', {
                text : gp
            }));
        });
    
        $('#grampanchayat').formSelect();

        $('#grampanchayat').change(function(e){
            handleSvamitvaVillagesIfExists();
        });
    }
}

function handleSvamitvaVillagesIfExists(){
    let selectedGP = $("#grampanchayat option:selected").text();
    let selectedDistrict = $("#district option:selected").text();
    selectedDistrict = selectedDistrict.toUpperCase();
    console.log(selectedGP);

    $('#villages-loader').find('option').remove().end().append('<option value="" disabled selected>Select Villages</option>');

    let svamitvaVillages = svamitvaVillagesData.map(function(value, index) { 
        if(value[1] == selectedGP && value[0] == selectedDistrict){
            return value[2] + " (" + value[3] + ")";
        }
    });

    // For removing blanks
    svamitvaVillages = svamitvaVillages.filter(item => item);

    $.each(svamitvaVillages, function (i, village) {
        $('#villages-loader').append($('<option>', {
            text : village
        }));
    });

    $('#villages-loader').formSelect();

    $('#villages-loader').change(function(e){
        let selectedVillage = $("#villages-loader option:selected").text();

        let chipVillages = M.Chips.getInstance($('#villages'));
        chipVillages.addChip({
            tag: selectedVillage
        });

        let chipsVillageData = chipVillages.chipsData;
        let villagesValue = "";
        for (let i = 0; i < chipsVillageData.length; i++){
            if(i == chipsVillageData.length - 1){
                villagesValue += chipsVillageData[i].tag;    
            } else {
                villagesValue += chipsVillageData[i].tag + ", ";
            }
        }
        console.log(villagesValue);
    });
}

// Activities / Weather Scripts --------------------------------------------------------------------------------

let activity_IDs = ['dronenumber', 'registerdate', 'registertime', 'pilot', 'copilot', 'district', 'taluk', 'detailinfo', 'activityremarks', 'campingarea'];
let activity_optionalIDs = ['detailinfo', 'campingarea'];
function submitActivityData(){
    let values = getIDValues(activity_IDs);
    console.log(values);
    
    let valuesOK = values.every(function (elem, index) {
        if(activity_optionalIDs.includes(elem[0])){
            return true
        } else {
            return elem[1] != "";
        }
    });

    if(valuesOK){
        console.log('Sending Activities Report');

        var uploadValues = values.map(function(val){
            return val[1];
        });

        console.log(uploadValues);

        $('#activity_hint').text('Sending To Server...');
        
        putActivityData(uploadValues);
    } else {
        M.toast({html: 'Check Your Data Properly...'});

        $('#activity_hint').text('Check Your Data Properly...');

        setTimeout(() => {
            $('button').prop('disabled', false);    
        }, 2000);
    }
}

function putActivityData(uploadValues){
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('checkUserNPutActivityData', [username, password, userRole, uploadValues]);
}

socket.on('activityMsg', function(msg){
    if(msg == 'success'){
        M.toast({html: 'Stored In Server...'});

        $('#activity_hint').text('Stored In Server...').removeClass('red green orange').addClass('green');
        document.getElementById('activity-form').reset();
        $('button').prop('disabled', false);
    } else {
        $('#activity_hint').text('Server Error...');
        $('button').prop('disabled', false);
    }
});

function getIDValues(IDs){
    let values = [];

    $.each(IDs, function (i, id) {
        // console.log($('#' + id).prop('type'));
        switch($('#' + id).prop('type')){
            case 'select-one':
                let nullValue = $($('#' + id + ' option')[0]).text()
                let value = $('#' + id + ' option:selected').text();
                if(value == nullValue){
                    value = "";
                }
                values.push([id, value]);
                break;
            case 'date':
                values.push([id, $('#' + id).val()]);
                break;
            case 'time':
                values.push([id, $('#' + id).val()]);
                break;
            case 'number':
                values.push([id, $('#' + id).val()]);
                break;
            case 'text':
                values.push([id, $('#' + id).val()]);
                break;
            case 'textarea':
                values.push([id, $('#' + id).val()]);
                break;
            case undefined:
                if(id == 'villages' || id == 'drones'){
                    let chipVillages = M.Chips.getInstance($('#' + id));
                    let chipsVillageData = chipVillages.chipsData;
                    let villagesValue = "";
                    for (let i = 0; i < chipsVillageData.length; i++){
                        if(i == chipsVillageData.length - 1){
                            villagesValue += chipsVillageData[i].tag;    
                        } else {
                            villagesValue += chipsVillageData[i].tag + ", ";
                        }
                    }
                    // console.log(villagesValue);
                    values.push([id, villagesValue]);
                }
                break;
        }
    });

    return values;
}

function printPDF(){
    window.print();
}

// Flight Register Scripts --------------------------------------------------------------------------------

let shapeFileName = "";
function readShapeFiles(){
    let geojsonFiles = [];
    let shapefilesValid = false;

    let file = document.getElementById("shapefile-fileinput").files[0];
    shapeFileName = file.name;
    console.log(shapeFileName);

    let filesize = parseInt(file.size / 1024);
    console.log(filesize);

    $('#shapefile-status')
        .text(`File Size is ${filesize} kB, Selected File Is Invalid... Select Valid File Or Try Zipping Files Again...`)
        .removeClass("red orange green").addClass("red");

    let reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function() {
        let result = reader.result
        // console.log(result);

        shp(result).then(function(geojson){
            console.log(geojson);

            if(Array.isArray(geojson)){
                geojsonFiles = geojson                 
            } else {
                geojsonFiles = [geojson]
            }

            if(filesize < 40){
                shapefilesValid = true;
            }

            let geoOBJ = {
                geoJSONArry: geojsonFiles
            }

            $('#geoObjStr').text(JSON.stringify(geoOBJ));

            if(shapefilesValid){
                $('#shapefile-status')
                    .text(`File Size is ${filesize} kB, File is Valid...`)
                    .removeClass("red orange green").addClass("green");
            }
        });
    };

    reader.onerror = function() {
        console.log(reader.error);
    };
}

function geoJSONDownload(){
    let geoObjStr = $('#geoObjStr').text();
    let geoOBJ = JSON.parse(geoObjStr);
    let geojson = geoOBJ.geoJSONArry[0];

    let gjsonFileName = shapeFileName.replace(".zip", ".json");

    let blob = new Blob([JSON.stringify(geojson)], { type: 'data:text/json;charset=utf-8;' });
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", gjsonFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

let flightRegister_IDs_set1 = ['dronenumber', 'flightdate', 'takeofftime', 'landingtime', 'flightcategory', 'flightnumber', 'flighttype', 'area', 'pilot', 'copilot', 'trainingflight', 'campingarea', 'district', 'taluk', 'grampanchayat', 'villages', 'totalabadi', 'totalhamlet'];
let flightRegister_IDs_set2 = ['currentabadi', 'currenthamlet', 'chunnamarked', 'pocketids', 'gridno', 'temperature', 'anemowind', 'qbasewind', 'overlap', 'extension', 'qbaseversion', 'trinityversion', 'pmbversion', 'escversion', 'missionplanner', 'missionchecker', 'images', 'geotagged', 'referencegcp'];
let flightRegister_IDs_set3 = ['checkpoint', 'whetherinitialprocessed', 'initialerror', 'finalerror', 'initialpoints', 'finalpoints', 'whethersending', 'foldername', 'filescount', 'foldersize', 'sendingmode', 'handedoverto', 'handedoveron', 'remarks'];

let flightRegister_IDs = flightRegister_IDs_set1.concat(flightRegister_IDs_set2).concat(flightRegister_IDs_set3);
// console.log(flightRegister_IDs);

let flightRegister_mandatoryIDs = ['dronenumber', 'flightdate', 'takeofftime', 'landingtime', 'flightcategory', 'flightnumber', 'flighttype', 'area', 'pilot', 'copilot', 'trainingflight', 'campingarea', 'district', 'taluk', 'grampanchayat', 'villages'];

function submitFlightData(){
    $('#saveAnchor').addClass('disabled');

    let values = getIDValues(flightRegister_IDs);
    // console.log(values);
    
    let valuesOK = values.every(function (elem, index) {
        if(!flightRegister_mandatoryIDs.includes(elem[0])){
            return true
        } else {
            return elem[1] != "";
        }
    });

    let qBaseFlightNumber = $('#uniqueQBaseFlightNo').val();

    if(valuesOK && qBaseFlightNumber != ""){
        M.toast({html: 'Sending Flight Report... Please Wait...'});
        console.log('Sending Flight Report');

        let uploadValues = values.map(function(val){
            return val[1];
        });

        let flightID = uploadValues.slice(0, 1).join("").replace(/\s/g, "") + "_" + flightNumberpad(qBaseFlightNumber, 4);

        uploadValues.unshift(flightID);
        uploadValues.push($('#geoObjStr').text());

        console.log(uploadValues);

        $('#data_submit_hint').text('Sending To Server...');
        
        putFlightData(uploadValues);
    } else {
        M.toast({html: 'Check Your Data Properly...'});

        $('#data_submit_hint').text('Check Your Data Properly...');
        setTimeout(() => {
            $('#saveAnchor').removeClass('disabled');
        }, 2000);
    }
}

function flightNumberpad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function putFlightData(uploadValues){
    let rowIndex = $('#editFlightIDRowIndex').text();
    console.log(rowIndex);

    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('checkUserNPutFlightData', [username, password, userRole, uploadValues, rowIndex]);
}

socket.on('flightStatusMsg', function(msg){
    if(msg == 'success'){
        M.toast({html: 'Data Managed In Server Succesfully...'});
        $('#data_submit_hint').text('Stored In Server...').removeClass('red green orange').addClass('green');

        setTimeout(() => {
            loadContent('pilot_flights');    
        }, 1000);
    } else {
        M.toast({html: 'Server Error...'});
        $('#data_submit_hint').text('Server Error...');

        $('#saveAnchor').removeClass('disabled');
    }
});

//  ----------------------------------------------------------------------------------------------------

function getFlightsForEditing(){
    console.log('Getting Flights...');

    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('getFlightsForEditing', [username, password, userRole]);
}

let savedFlightRowsFromSheet = [];
socket.on('handleSearchedFlightsForEditing', function(dataRows){
    let whetherData = dataRows[0];
    let rows = dataRows[1];
    savedFlightRowsFromSheet = rows;
    
    if(whetherData == 'data'){
        console.log(rows);
        $('#searched-flights tbody').empty();

        for (let i = 0; i < rows.length; i++){
            // 1 for heading, 1 for 0-index
            let index = rows[i][0];

            let flightID = rows[i][3];
            let flightDate = rows[i][5];

            let takeoff = rows[i][6];
            let landing = rows[i][7];

            let pilot = rows[i][12]
            let copilot = rows[i][13]

            let district = rows[i][16]
            let taluk = rows[i][17]
            let grampanchayat = rows[i][18]
            let revenuevillage = rows[i][19]

            let markedForDeletion = rows[i][2];

            let markForDeletionIcon = '';
            let tooltip_toggleDeletion = ''
            if(markedForDeletion == 'Yes'){
                markForDeletionIcon = 'restore';
                tooltip_toggleDeletion = 'Mark For Restore';
            } else {
                markForDeletionIcon = 'delete';
                tooltip_toggleDeletion = 'Mark For Deletion';
            }
            
            let newRow = `<tr>
                <td>${flightID}</td>
                <td>${flightDate}<br/>${takeoff}<br/>${landing}</td>
                <td>${pilot}<br/>${copilot}</td>
                <td>District: ${district}<br/>Taluk: ${taluk}<br/>Gram Panchayat: ${grampanchayat}<br/>Villages: ${revenuevillage}</td>
                <td><a class="waves-effect waves-light btn-small" onclick="fillFlightInformation(${index}); "><i class="material-icons">edit</i></a></td>
                <td><a class="waves-effect waves-light btn-small" title="${tooltip_toggleDeletion}" onclick="toggleDeletion(${index}, '${flightID}'); this.disabled=true;"><i class="material-icons">${markForDeletionIcon}</i></a></td>
            </tr>`;

            $('#searched-flights tbody').append(newRow);
        }
    } else if (whetherData == 'nodata'){
        let emptyRow = "<tr><td colspan='6'>No Flights...</td></tr>";
        $('#searched-flights tbody').append(emptyRow);
    }
});

//  ----------------------------------------------------------------------------------------------------

function fillFlightInformation(index){
    $('#editflightsmodal').modal('close');

    console.log('filling', index);

    let formInfo = getFormInfoForIndex(index);
    // console.log(formInfo);

    fillFieldValues(formInfo);
}

function getFormInfoForIndex(index){
    for (let i = 0; i < savedFlightRowsFromSheet.length; i++){
        let row = savedFlightRowsFromSheet[i];
        if(row[0] == index){
            return row;
        }
    }
}

function fillFieldValues(formInfo){
    let rowIndex = formInfo[0];
    $('#editFlightIDRowIndex').text(rowIndex);

    let geoJSONArry = formInfo[55];

    if(geoJSONArry != '-'){
        $('#geoObjStr').text(geoJSONArry);

        $('#shapefile-status')
            .text(`Shapefile Exists...`)
            .removeClass("red orange green").addClass("green");
    } else {
        $('#shapefile-status').text('Select *.zip file').removeClass('red green orange');
    }

    let flightID = formInfo.slice(3,4)[0];
    let uniqueQBaseFlightNumber = parseInt(flightID.split("_")[1]);
    $('#uniqueQBaseFlightNo').val(uniqueQBaseFlightNumber);

    let filterdFormInfo = formInfo.slice(4, 55);
    let mappedFormInfo = filterdFormInfo.map(function(val){
        if(val == "-"){
            return "";
        } else {
            return val;
        }
    });

    console.log(mappedFormInfo);

    let flightCatVal = mappedFormInfo[4];
    // console.log(flightCatVal);

    if (flightCatVal == 'LSMK / Svamitva' || flightCatVal == 'Svamitva'){
        console.log('loadingSvamitvaVillagesHTML');
        loadSvamitvaVillagesHTML();
        loadSvamitvaVillagesDataFromServer();
        changeFromDistrictsFunc();
    }

    $.each(flightRegister_IDs, function (i, id) {
        //console.log($('#' + id).prop('type'));
        let value = mappedFormInfo[i];

        switch($('#' + id).prop('type')){
            case 'select-one':
                if(value != ''){
                    let whetherOptionExists = $(`#${id} option:contains(${value})`).length;
                    // console.log(whetherOptionExists);

                    if(whetherOptionExists > 0){
                        $(`#${id} option:contains(${value})`).attr('selected', 'selected');
                    } else {
                        $(`#${id}`).append($('<option>', {
                            text : value
                        }));
                        $(`#${id} option:last`).prop("selected", "selected");
                    }
                } else {
                    $(`#${id}`).find('option').removeAttr("disabled selected");

                    $($('#' + id + ' option')[0]).attr('selected', 'selected');
                    $($('#' + id + ' option')[0]).attr('disabled', 'disabled');
                }
                break;
            case 'date':
                $('#' + id).val(value);
                break;
            case 'time':
                $('#' + id).val(value);
                break;
            case 'number':
                $('#' + id).val(value);
                break;
            case 'text':
                $('#' + id).val(value);
                break;
            case 'textarea':
                $('#' + id).val(value);
                break;
            case undefined:
                if(id == 'villages'){
                    // console.log('came here');
                    let chipVillages = M.Chips.getInstance($('#villages'));

                    let villages = mappedFormInfo[15];
                    let villagesArry = villages.split(',');
                    
                    for (let i = 0; i < villagesArry.length; i++){
                        chipVillages.addChip({
                            tag: villagesArry[i]
                        });
                    }
                }
                break;
        }
    });

    setTimeout(function(){
        M.updateTextFields();
        $('select').formSelect();
        setFlightIDInLabel();
    }, 500);
}

//  ----------------------------------------------------------------------------------------------------

function toggleDeletion(rowIndex, flightID){
    console.log('marking', rowIndex, flightID);

    M.toast({html: 'Performing Task! Please Wait...'});

    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("password");
    let userRole = sessionStorage.getItem("userRole");

    socket.emit('toggleDeletionMarked', [username, password, userRole, rowIndex, flightID]);
}

socket.on('handToggleDeletionMsg', function(msg){
    if(msg == 'unauthorized'){
        M.toast({html: 'Unauthorized Request...'});
    } else if (msg == 'invalidrequest'){
        M.toast({html: 'Invalid Request...'});
    } else if (msg == 'servererror'){
        M.toast({html: 'Server Error...'});
    } else {
        M.toast({html: 'Task Done...'});
        getFlightsForEditing();
    }
});

// Logout   ----------------------------------------------------------------------------------------------------

function logout(){
    sessionStorage.setItem("username", "");
    sessionStorage.setItem("password", "");
    sessionStorage.setItem("userRole", "");

    window.location.href = "/";
}

// Exporting CSV   ----------------------------------------------------------------------------------------------------

let csvExportingHeaderRow = ['FLIGHT_ID', 'DRONE NO', 'FLIGHT DATE', 'TAKEOFF TIME', 'LANDING TIME', 'FLIGHT CATEGORY', 'FLIGHT NUMBER', 'FRESH / REFLY', 'AREA (SQ.KM.)', 'PILOT', 'CO-PILOT', 'TRAINING FLIGHT', 'CAMPING AREA', 'DISTRICT', 'TALUK', 'GRAM PANCHAYAT', 'REVENUE VILLAGE', 'TOTAL SETTLEMENTS IN VILLAGE', 'TOTAL HAMLETS IN VILLAGE', 'SETTLEMENTS IN CURRENT FLIGHT', 'HAMLETS IN CURRENT FLIGHT', 'CHUNNA MARKED', 'SETTLEMENT / HAMLET IDs', 'LSMK Flying Grid', 'TEMPERATURE', 'WIND SPEED (ANEMOMETER)', 'WIND SPEED (Q-BASE)', 'OVERLAP', 'EXTENSION', 'QBASE VERSION', 'DRONE VERSION', 'PMB VERSION', 'ESC VERSION', 'MISSION PLANNER', 'MISSION CHECKER', 'RAW IMAGES', 'GEOTAGGED IMAGES', 'GCP POINT CODE', 'CHECK POINT', 'INITIAL PROCESSING DONE', 'INITIAL ERROR', 'FINAL ERROR', 'INITIAL TIE POINTS', 'FINAL TIE POINTS', 'SENDING TO OFFICE / REFLYING', 'FOLDER NAME', 'NUMBER OF FILES', 'FOLDER SIZE', 'MODE OF SENDING', 'HANDED OVER TO', 'SENT ON', 'REMARKS'];
function exportToCSVThisForm(){
    let values = getIDValues(flightRegister_IDs);
    let downloadValues = values.map(function(val){
        return val[1];
    });

    let flightID = downloadValues.slice(0, 3).join('_').replace(/\s/g, "").replace(":", "");
    downloadValues.unshift(flightID);

    let csvRows = [];
    csvRows.push(csvExportingHeaderRow);
    csvRows.push(downloadValues);

    exportToCsv('CurrentFlight.csv', csvRows);
}

function exportToCSVAllEditFlights(){
    let csvRows = [];
    csvRows.push(csvExportingHeaderRow);

    let downloadValues2D = savedFlightRowsFromSheet.map(function(row){
        return row.slice(3, 55);
    });

    csvRows = csvRows.concat(downloadValues2D);
    exportToCsv('AllFlights.csv', csvRows);
}

function exportToCsv(filename, rows) {
    let processRow = function (row) {
        let finalVal = '';
        for (let j = 0; j < row.length; j++) {
            let innerValue = row[j] === null ? '' : row[j].toString();
            let result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    let csvFile = '';
    for (let i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    let blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        let link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            let url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
