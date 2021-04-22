import WebSocket from 'ws';
import { join } from 'path';
import sql from 'sqlite3';
import { mkdirSync } from 'fs';

const sqlite3 = sql.verbose();

const databasesPath = 'D:/Servers/Databases/';

const usersDB = join(databasesPath, 'kgdc-users.db');
const attendanceDB = join(databasesPath, 'kgdc-attendance.db');

const respondWithFailureMsg = (ws: WebSocket) => {
    let responseObj = { requestStatus: 'failure' };
    ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
}

export const createTablesIfNotExistsIntoDatabase = () => {
    mkdirSync(databasesPath, { recursive: true });
    
    let usersdb = new sqlite3.Database(usersDB, (err: any) => {
        if (err) {
            console.log(err.message);
            return 0;
        } else {
            let createTableQuery = `CREATE TABLE IF NOT EXISTS users(
                Name TEXT NOT NULL,
                MobileNumber TEXT NOT NULL PRIMARY KEY,
                Password TEXT NOT NULL,
                UUID TEXT,
                ROLES TEXT
            );`;

            usersdb.exec(createTableQuery, (err: any)=>{
                if (err){
                    console.log(err.message);
                    return 0;
                } else {
                    usersdb.close();
                }
            });
        }
    });

    let attendancedb = new sqlite3.Database(attendanceDB, (err: any) => {
        if (err) {
            console.log(err.message);
            return 0;
        } else {
            let createTableQuery = `CREATE TABLE IF NOT EXISTS attendanceregister(
                ServerDate TEXT NOT NULL,
                ServerTime TEXT NOT NULL,
                ClientDate TEXT NOT NULL,
                ClientTime TEXT NOT NULL,
                Name TEXT NOT NULL,
                AttendanceType TEXT NOT NULL,
                Remarks TEXT NOT NULL,
                MobileNumber TEXT NOT NULL,
                UUID TEXT,
                Latitude TEXT NOT NULL,
                Longitude TEXT NOT NULL,
                Accuracy TEXT NOT NULL
            );`;

            attendancedb.exec(createTableQuery, (err: any)=>{
                if (err){
                    console.log(err.message);
                    return 0;
                } else {
                    attendancedb.close();
                }
            });
        }
    });
}

// User Logics

export const newregistration = (ws: WebSocket, msgObj: any) => {
    try {
        let db = new sqlite3.Database(usersDB, (err: any) => {
            if (err) {
                console.log(err.message);
                respondWithFailureMsg(ws);
            } else {
                let insertQuery = `INSERT INTO users(Name, MobileNumber, Password, UUID, ROLES) VALUES (?,?,?,?,?)`;
                
                let { name, mobilenumber, password, UUID } = msgObj;
                // console.log(name, mobilenumber, password, UUID);
                let insertData = [name, mobilenumber, password, UUID, ''];
        
                db.run(insertQuery, insertData, function(err: any) {
                    db.close();
                    if (err) {
                        console.log(err.message);
                        respondWithFailureMsg(ws);
                    } else {
                        let responseObj = { requestStatus: 'success' };
                        ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
                    }
                });
            }
            return 0;
        });
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

export const checkUser = (ws: WebSocket, msgObj: any) => {
    try {
        let db = new sqlite3.Database(usersDB, (err: any) => {
            if (err) {
                console.log(err.message);
                respondWithFailureMsg(ws);
            } else {
                let { mobilenumber, password, rolecheck } = msgObj;
                let sql = `SELECT Name, MobileNumber, Password, ROLES FROM users`;
                db.all(sql, [], (err: ErrorEvent, rows: Array<any>) => {
                    db.close();
                    if (err) {
                        console.log(err.message);
                        respondWithFailureMsg(ws);
                    } else {
                        let userFound = false;
                        for (let i = 0; i < rows.length; i++){
                            let row = rows[i];
                            
                            let hasRole = false;
                            let roles = row.ROLES;
                            if(roles != ''){
                                let rolesArry = roles.split(',');
                                if(rolesArry.includes(rolecheck)){
                                    hasRole = true;
                                }
                            }
                            
                            if(row.MobileNumber == mobilenumber && row.Password == password && hasRole){
                                userFound = true;
                                let responseObj = { requestStatus: 'success', validUser: true, name: row.Name };
                                ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
                                return 0;
                            }
                        }
                        
                        if(!userFound){
                            let responseObj = { requestStatus: 'success', validUser: false };
                            ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
                        }
                    }
                });
            }
            return 0;
        });
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

export const logAttendance = (ws: WebSocket, msgObj: any) => {
    try {
        let db = new sqlite3.Database(usersDB, (err: any) => {
            if (err) {
                console.log(err.message);
                respondWithFailureMsg(ws);
            } else {
                let { mobilenumber, password, rolecheck } = msgObj;
    
                let sql = `SELECT Name, MobileNumber, Password, ROLES FROM users`;
                db.all(sql, [], (err: ErrorEvent, rows: Array<any>) => {
                    if (err) {
                        console.log(err.message);
                        respondWithFailureMsg(ws);
                    } else {
                        let userFound = false;
                        for (let i = 0; i < rows.length; i++){
                            let row = rows[i];
                            
                            let hasRole = false;
                            let roles = row.ROLES;
                            if(roles != ''){
                                let rolesArry = roles.split(',');
                                if(rolesArry.includes(rolecheck)){
                                    hasRole = true;
                                }
                            }
                            
                            if(row.MobileNumber == mobilenumber && row.Password == password && hasRole){
                                userFound = true;
                                makeAttendanceEntry(ws, msgObj);
                            }
                        }
                        
                        if(!userFound){
                            let responseObj = { requestStatus: 'success', validUser: false, action: 'unknown' };
                            ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
                        }
                    }
                });
            }
            return 0;
        });
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

export const makeAttendanceEntry = (ws: WebSocket, msgObj: any) => {
    try {
        let db = new sqlite3.Database(attendanceDB, (err: any) => {
            if (err) {
                console.log(err.message);
                respondWithFailureMsg(ws);
            } else {
                let dateNow = new Date();
                let serverdate = dateNow.toLocaleDateString('en-GB');
                let servertime = dateNow.toLocaleTimeString('en-GB');

                let { clientdate, clienttime, name, attendancetype, remarks, mobilenumber, UUID } = msgObj;
                let { latitude, longitude, accuracy } = msgObj;

                let insertQuery = `INSERT INTO attendanceregister(
                    ServerDate, ServerTime, ClientDate, ClientTime, Name, AttendanceType, Remarks, 
                    MobileNumber, UUID, Latitude, Longitude, Accuracy) 
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
                
                // console.log(clientdate, clienttime, name, attendancetype, remarks, UUID);
                let insertData = [serverdate, servertime, clientdate, clienttime, name, attendancetype, remarks, mobilenumber, UUID, latitude, longitude, accuracy];

                db.run(insertQuery, insertData, function(err: any) {
                    db.close();
                    if (err) {
                        console.log(err.message);
                        respondWithFailureMsg(ws);
                    } else {
                        let responseObj = { requestStatus: 'success', validuser: true, action: 'attendanceregistered' };
                        ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
                    }
                    return 0;
                });
            }
            return 0;
        });
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

// Admin Logics

export const displayUsersTable = (ws: WebSocket, msgObj: any) => {
    try{
        if(msgObj.user == 'admin' && msgObj.pass == 'dbadminkgdc'){
            let db = new sqlite3.Database(usersDB, (err: any) => {
                if (err) {
                    console.log(err.message);
                    respondWithFailureMsg(ws);
                } else {
                    let sql = `SELECT Name, MobileNumber, Password, UUID, ROLES FROM users`;
                    db.all(sql, [], (err, rows) => {
                        console.log(rows);
                        // db.close();
                        if (err) {
                            console.log(err.message);
                            respondWithFailureMsg(ws);
                        } else {
                            ws.send(Buffer.from(JSON.stringify(rows)).toString('base64'));
                        }
                    });
                }
                return 0;
            });
        }
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

export const assignRole = (ws: WebSocket, msgObj: any) => {
    try {
        if(msgObj.user == 'admin' && msgObj.pass == 'dbadminkgdc'){
            let db = new sqlite3.Database(usersDB, (err: any) => {
                if (err) {
                    console.log(err.message);
                    respondWithFailureMsg(ws);
                } else {
                    let mobileNumberToUpdate = msgObj.mobilenumber;
                    let modifiedRole = msgObj.modifiedRole;
    
                    let sql = `UPDATE users SET ROLES = '${modifiedRole}' WHERE MobileNumber = ?`;
                    db.run(sql, [mobileNumberToUpdate], (err: any) => {
                        db.close();
                        if(err){
                            console.log(err.message);
                            respondWithFailureMsg(ws);
                        } else {
                            let responseObj = { requestStatus: 'success', adminuser: true, action: 'assigned' };
                            ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
                        }
                    });
                }
                return 0;
            });
        } else {
            let responseObj = { requestStatus: 'success', adminuser: false, action: 'ignored' };
            ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
        }
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

export const deleteUser = (ws: WebSocket, msgObj: any) => {
    try {
        if(msgObj.user == 'admin' && msgObj.pass == 'dbadminkgdc'){
            let db = new sqlite3.Database(usersDB, (err: any) => {
                if (err) {
                    console.log(err.message);
                    respondWithFailureMsg(ws);
                } else {
                    let mobileNumberToDel = msgObj.mobilenumber;
        
                    db.run(`DELETE FROM users WHERE MobileNumber=?`, mobileNumberToDel, function(err: any) {
                        db.close();
                        if (err) {
                            console.log(err.message);
                            respondWithFailureMsg(ws);
                        } else {
                            let responseObj = { requestStatus: 'success', adminuser: true, action: 'deleted' };
                            ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
                        }
                    });
                }
            });
        } else {
            let responseObj = { requestStatus: 'success', adminuser: false, action: 'ignored' };
            ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
        }
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

export const getAttendanceRegister = (ws: WebSocket, msgObj: any) => {
    try{
        if(msgObj.user == 'admin' && msgObj.pass == 'dbadminkgdc'){
            let db = new sqlite3.Database(attendanceDB, (err: any) => {
                if (err) {
                    console.log(err.message);
                    respondWithFailureMsg(ws);
                } else {
                    let sql = `SELECT ServerDate, ServerTime, ClientDate, ClientTime, Name, AttendanceType, Remarks, 
                    MobileNumber, UUID, Latitude, Longitude, Accuracy FROM attendanceregister ORDER BY rowid DESC LIMIT 100;`;
                    
                    db.all(sql, [], (err, rows) => {
                        db.close();
                        if (err) {
                            console.log(err.message);
                            respondWithFailureMsg(ws);
                        } else {
                            ws.send(Buffer.from(JSON.stringify(rows)).toString('base64'));
                        }
                    });
                }
                return 0;
            });
        } else {
            let responseObj = { requestStatus: 'success', adminuser: false, action: 'ignored' };
            ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
        }
    } catch (e) {
        respondWithFailureMsg(ws);
        return 0;
    }
}

export const checkAdmin = (ws: WebSocket, msgObj: any) => {
    if(msgObj.user == 'admin' && msgObj.pass == 'dbadminkgdc'){
        let responseObj = { requestStatus: 'success', adminuser: true };
        ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
    } else {
        let responseObj = { requestStatus: 'success', adminuser: false };
        ws.send(Buffer.from(JSON.stringify(responseObj)).toString('base64'));
    }
}