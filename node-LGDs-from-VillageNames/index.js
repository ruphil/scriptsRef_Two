const xlsx = require('xlsx');
const fs = require('fs');
const stringSimilarity = require("string-similarity");

let villagesmissinglgds = 'D:/GIS/Ramanagara-karnataka-villages-single.csv';
let villagesLGDSource = 'D:/GIS/Ramanagara-Villages_LGDCodes_Compiled.xlsx';

let txtParentPath = 'D:/cwd/';
let colDataTxtPath = txtParentPath + 'dump1.txt';
let lgdSourceTxtPath = txtParentPath + 'dump2.txt'

let colDatavillagesmissinglgds = [];
let lgdSource = [];

try {
    console.log('Parsing From Txt...');

    colDatavillagesmissinglgds = JSON.parse(fs.readFileSync(colDataTxtPath));
    lgdSource = JSON.parse(fs.readFileSync(lgdSourceTxtPath));
} catch (error) {
    console.log('Parsing Txt Failed...');

    colDatavillagesmissinglgds = getColumnsData(['P', 'O', 'T', 'Z'], villagesmissinglgds);
    fs.writeFileSync(colDataTxtPath, JSON.stringify(colDatavillagesmissinglgds));

    lgdSource = getColumnsData(['A', 'G', 'K', 'L', 'E', 'I', 'M'], villagesLGDSource);
    fs.writeFileSync(lgdSourceTxtPath, JSON.stringify(lgdSource));

    console.log('Serialized Arrays into Txt...');
}

// console.log(colDatavillagesmissinglgds);
// console.log(lgdSource);

for(let i = 0; i < colDatavillagesmissinglgds.length; i++){
    let villageData = colDatavillagesmissinglgds[i];
    let lgdcode = parseInt(villageData[0]);
    if(lgdcode == 0){
        // console.log(villageData);

        let villageName = villageData[1];
        let gpName = villageData[2];
        let district = villageData[3];

        for (let j = 0; j < lgdSource.length; j++){
            let compiledVillageData = lgdSource[j];
            // console.log(compiledVillageData);
            
            // let lgdCodeCompiled = compiledVillageData[0];
            
            let districtCompiled1 = compiledVillageData[1];
            let districtCompiled2 = compiledVillageData[2];
            let gpCompiled = compiledVillageData[3];
            let villageCompiled1 = compiledVillageData[4];
            let villageCompiled2 = compiledVillageData[5];
            let villageCompiled3 = compiledVillageData[6];

            let condA1 = false;
            let condA2 = false;
            let condB1 = false;
            let condC1 = false;
            let condC2 = false;
            let condC3 = false;

            let checkScore = 0.8;

            try{
                condA1 = gS(district, districtCompiled1) > checkScore;
            } catch {}

            try{
                condA2 = gS(district, districtCompiled2) > checkScore;
            } catch {}

            let condX = condA1 || condA2;
            if(!condX) continue;
            console.log('District Condition Passed...');

            // try{
            //     condB1 = gS(gpName, gpCompiled) > checkScore;
            // } catch {}

            // let condY = condB1;
            // if(!condY) continue;
            // console.log('GP Condition Passed...');

            try{
                condC1 = gS(villageName, villageCompiled1) > checkScore;
            } catch {}

            try{
                condC2 = gS(villageName, villageCompiled2) > checkScore;
            } catch {}

            try{
                condC3 = gS(villageName, villageCompiled3) > checkScore;
            } catch {}

            let condZ = condC1 || condC2 || condC3;
            console.log('Village Condition Also Passed...');

            if(condZ){
                console.log(villageData, compiledVillageData);
            }
        }
    }
}

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