import XLSX from 'xlsx';

let downloadBtn: HTMLElement = document.getElementById('downloadExcel')!;

downloadBtn.onclick = function (){

    let wb = XLSX.utils.book_new();
    

    var ws_data = [
        [ "S", "h", "e", "e", "t", "J", "S" ],
        [  1 ,  2 ,  3 ,  4 ,  5 ]
    ];

    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    // ws.A1.c.push({a:"SheetJS", t:"I'm a litstle comment, short and stout!"});
    

    console.log(ws.A1)

    const merge = [
        { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },{ s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
      ];

      ws["!merges"] = merge;
    
    /* Add the worksheet to the workbook */
    XLSX.utils.book_append_sheet(wb, ws, 'DPR_Drone_Flying');

    // console.log(wb);

    XLSX.writeFile(wb, 'out.xlsx');
}
