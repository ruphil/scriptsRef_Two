import { ExcelParser } from './excel.parse';

export class ExcelReader {
    constructor(file: File){
        let reader = new FileReader();

        reader.onload = function(e: any) {
            let data = e.target.result;
            new ExcelParser(data);
        }

        reader.readAsBinaryString(file);

        // Block for Exporting DataURL

        // let reader1 = new FileReader();
        // reader1.onload = function(e: any) {
        //     let data = e.target.result;
        //     console.log(data);
        // }
        // reader1.readAsDataURL(file);
    }
}
