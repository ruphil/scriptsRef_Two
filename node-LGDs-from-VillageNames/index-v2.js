const xlsx = require('xlsx');
const fs = require('fs');
const stringSimilarity = require("string-similarity");

let villagesmissinglgds = 'D:/HuntingVillages/Ramanagara-karnataka-villages-single.csv';
let villagesLGDSource = 'D:/HuntingVillages/Ramanagara-Villages_LGDCodes_Compiled.xlsx';

let checkScore = 0.95;

let txtParentPath = 'D:/HuntingVillages/cwd/';


let colDataTxtPath = txtParentPath + 'dump1.txt';
let lgdSourceTxtPath = txtParentPath + 'dump2.txt';

let joinedCSV = txtParentPath + 'joined_' + checkScore.toString() +'.csv';
fs.writeFileSync(joinedCSV, '');

let colDatavillagesmissinglgds = [];
let lgdSource = [];

try {
    console.log('Parsing From Txt...');

    colDatavillagesmissinglgds = JSON.parse(fs.readFileSync(colDataTxtPath));
    lgdSource = JSON.parse(fs.readFileSync(lgdSourceTxtPath));
} catch (error) {
    console.log('Parsing Txt Failed...');

    colDatavillagesmissinglgds = getColumnsData(['M', 'P', 'V', 'T', 'O'], villagesmissinglgds);
    fs.writeFileSync(colDataTxtPath, JSON.stringify(colDatavillagesmissinglgds));

    lgdSource = getColumnsData(['A', 'D', 'L', 'E', 'I', 'M'], villagesLGDSource);
    fs.writeFileSync(lgdSourceTxtPath, JSON.stringify(lgdSource));

    console.log('Serialized Arrays into Txt...');
}

// console.log(colDatavillagesmissinglgds);
// console.log(lgdSource);

let headerArry = ['UNIQUEVILLAGECODE', 'LGD-GDB', 'LGD', 'Hobli-GDB', 'Hobli', 'GP-GDB', 'GP', 'Village-GDB', 'Vil1', 'Vil2', 'Vil3', '\n'];
fs.appendFileSync(joinedCSV, headerArry.join(','));
for(let i = 0; i < colDatavillagesmissinglgds.length; i++){
    let uniqueVillageCode = colDatavillagesmissinglgds[i][0]
    let lgdcodeGDB = parseInt(colDatavillagesmissinglgds[i][1]);
    let hobliGDB = colDatavillagesmissinglgds[i][2];
    let GPGDB = colDatavillagesmissinglgds[i][3];
    let villageNameGDB = colDatavillagesmissinglgds[i][4];
    if(lgdcodeGDB == 0){
        for (let j = 0; j < lgdSource.length; j++){
            let lgdCode = lgdSource[j][0];
            let hobli = lgdSource[j][1];
            let gp = lgdSource[j][2];
            let villageName1 = lgdSource[j][3];
            let villageName2 = lgdSource[j][4];
            let villageName3 = lgdSource[j][5];

            try{
                cond1 = gS(villageNameGDB, villageName1) > checkScore;
            } catch {}

            try{
                cond2 = gS(villageNameGDB, villageName2) > checkScore;
            } catch {}

            try{
                cond3 = gS(villageNameGDB, villageName3) > checkScore;
            } catch {}

            let condZ = cond1 || cond2 || cond3;

            if(condZ){
                // console.log(colDatavillagesmissinglgds[i], lgdSource[j]);
                let arry = [uniqueVillageCode, lgdcodeGDB, lgdCode, hobliGDB, hobli, GPGDB, gp, villageNameGDB, villageName1, villageName2, villageName3, '\n']
                fs.appendFileSync(joinedCSV, arry.join(','));
            }
        }
    }
}

console.log('Done...');

// getScore Function
function gS(str1, str2){
    let scoreValue = stringSimilarity.compareTwoStrings(str1, str2);
    // console.log(scoreValue);
    return scoreValue;
}

function getColumnsData(cols, filePath){
    let workbook = xlsx.readFile(filePath);
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];

    let range = xlsx.utils.decode_range(worksheet['!ref']);
    let num_rows = range.e.r - range.s.r + 1;
    // let num_cols = range.e.c - range.s.c + 1;

    let colData = [];
    for (let i = 0; i < num_rows; i++){
        let rowData = [];
        for (let j = 0; j < cols.length; j++){
            let A1Notation = cols[j] + (i + 1).toString();
            let valueObj = worksheet[A1Notation];
            if (valueObj == undefined){
                rowData.push(undefined);
            } else {
                rowData.push(valueObj.v);
            }
            
        }
        colData.push(rowData);
    }

    return colData;
}