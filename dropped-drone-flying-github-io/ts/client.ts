import { ExcelUploader } from './excel.upload';
import { ExcelReader } from './excel.reader';
import { DownloadFormattedExcel } from './excel.download';

let downloadBtn: HTMLElement = document.getElementById('downloadExcel')!;
let fileInput: HTMLElement = document.getElementById('fileinput')!;
let uploadData: HTMLElement = document.getElementById('uploadData')!;

downloadBtn.onclick = async function (){
    new DownloadFormattedExcel('DF-DPR');
}

fileInput.onchange = function (e: Event){
    const target = e.target as HTMLInputElement;
    new ExcelReader(target.files![0]);
}

uploadData.onclick = async function (){
    new ExcelUploader();
}