const ss = SpreadsheetApp.openById('1BObE4kG3n9NCN2SMsHGdZZb_4i4VQZgP758U5zC_7jM');

const doGet = (event = {}) => {
  try {
    const { parameter } = event;
    const { type } = parameter;
    
    if(type == 'registration'){
      const { name, mobile, password, uuid } = parameter;

      let sheet = ss.getSheetByName('users');
      sheet.appendRow([name, mobile, password, uuid, 'New']);
      
      return ContentService.createTextOutput('success');
    } else if (type == 'login'){
      const { mobile, password } = parameter;

      let userCheckObj = checkUser(mobile, password);
      return ContentService.createTextOutput(JSON.stringify(userCheckObj));
    } else if (type == 'attendance'){
      const { sysDateTime, name, mobile, uuid, movementtype, remarks, latitude, longitude, accuracy, gmapsurl } = parameter;
      
      let dateNow = new Date();
      let serverDateTime = dateNow.toLocaleDateString() + " | " + dateNow.toLocaleTimeString();

      let sheet = ss.getSheetByName('attendance');
      sheet.appendRow([serverDateTime, sysDateTime, name, movementtype, remarks, uuid, mobile, latitude, longitude, accuracy, gmapsurl]);
      
      return ContentService.createTextOutput('success');
    }

    return ContentService.createTextOutput('404');
  } catch (e) {
    return ContentService.createTextOutput('failure');
  }
}

const checkUser = (user, pass) => {
  let sheet = ss.getSheetByName('users');
  let values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();

  for (let i = 0; i < values.length; i++){
    let row = values[i];
    let name = row[0];
    let userInSheet = row[1];
    let passInSheet = row[2];
    let whetherApproved = row[4];

    if(userInSheet == user && passInSheet == pass && whetherApproved == 'Approved'){
      return {
        'validuser': true,
        'name': name
      };
    }
  }
  
  return {
    'validuser': false
  };
}
