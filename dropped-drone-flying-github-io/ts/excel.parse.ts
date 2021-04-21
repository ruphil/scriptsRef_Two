import ExcelJS from 'exceljs';
import { DPRXLFormat } from './excel.dprformat';
import { GlobalVariables } from './global.vars';

let dataHolderDiv: HTMLElement = document.getElementById('xlDataHolder')!;

export class ExcelParser {
    dprSheet: ExcelJS.Worksheet | undefined;

    constructor(binaryString: Buffer){
        const workbook = new ExcelJS.Workbook();

        workbook.xlsx.load(binaryString).then((wb => {
            this.dprSheet = wb.getWorksheet('DPR-DF');
            let xlIdentity = this.dprSheet.getCell('A46').text;
            
            if(xlIdentity == DPRXLFormat.excelFormatIdentity){
                console.log('Excel is Valid');
            }

            let dprDate             =   this.dprSheet.getCell('J1').value;
            let droneNumber         =   this.dprSheet.getCell('D2').value;
            let contactNumber       =   this.dprSheet.getCell('H2').value;
            let pilotName           =   this.dprSheet.getCell('D3').value;
            let fieldAssistant      =   this.dprSheet.getCell('H3').value;
            let campingDistrict     =   this.dprSheet.getCell('D4').value;

            let metaData = JSON.stringify({
                campingArea: this.dprSheet.getCell('H4').value,
                overlap:            this.dprSheet.getCell('D5').value,
                softwareversion:    this.dprSheet.getCell('H5').value,
                entryexitextension: this.dprSheet.getCell('D6').value,
                areabuffer:         this.dprSheet.getCell('H6').value
            });
            
            let flightData = JSON.stringify({
                flightSection1:     this.getRowValues(11, 19),
                flightSection2:     this.getRowValues(21, 29),
                flightSection3:     this.getRowValues(31, 39)
            });

            let summaryData = JSON.stringify({
                summary: this.getRowValues(41, 42)
            });

            let remarksData = JSON.stringify({
                remarks: this.getRowValues(44, 44)
            });

            GlobalVariables.globalPostData = [dprDate, droneNumber, contactNumber, pilotName, fieldAssistant, campingDistrict, metaData, flightData, summaryData, remarksData];

            dataHolderDiv.innerText = JSON.stringify({
                jsonArry: GlobalVariables.globalPostData
            });
            
            console.log(dataHolderDiv.innerText.length);
        }));
    }

    getRowValues(start: number, end: number){
        let flightSection = [];
        for (let i = start; i <= end; i++){
            flightSection.push(this.dprSheet!.getRow(i).values)
        }
        return flightSection;
    }
}