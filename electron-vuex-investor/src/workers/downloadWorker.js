const exitFunction = () => {
    self.close();
    self.postMessage({ msg: 'exit' });
}

self.onmessage = function(event){
    let data = event.data;
    console.log(data);
    if (data.command == 'close'){
        exitFunction();
    }
}

//  Worker Script   ---------------------------------------------------------------------------------------------------

import fs from 'fs';
import moment from 'moment';
import axios from 'axios';

let currentDate = moment("2021-04-01", "YYYY-MM-DD");
let endDdate = moment("2021-04-02", "YYYY-MM-DD");

let intervalDate = setInterval(()=>{

    let dayWeek = currentDate.day();

    if(dayWeek != 6 && dayWeek != 0){
        downloadNSaveToSqlite(currentDate);
    }
    
    currentDate = currentDate.add(1, 'day');

    if(currentDate.isAfter(endDdate)){
        clearInterval(intervalDate);
    }
}, 5000);

const downloadNSaveToSqlite = async (currentDate) => {
    let dateStr = currentDate.format('YYYY-MM-DD');
    let formattedURL = 'https://icontentdelivery.appspot.com?date=' + dateStr;
    let filePath = 'D:/tmp/' + dateStr + '.zip';
    
    downloadURL(formattedURL, filePath);
}

const downloadURL = (formattedURL, filePath) => {
    console.log(formattedURL);

    axios.get(formattedURL, { responseType: 'arraybuffer' })
    .then(res => {
        console.log(res.status);
        fs.writeFile(filePath, res.data, ()=>{ console.log(filePath + ' saved...')});
    })
    .catch(err => {
        console.log('error');
        console.log(err.status);
    });
}


















    // https://archives.nseindia.com/content/historical/EQUITIES/2021/APR/cm07APR2021bhav.csv.zip

    // let url = 'https://www.nseindia.com/api/reports?archives=[{"name":"CM - Bhavcopy(csv)","type":"archives","category":"capital-market","section":"equities"}]&date=09-Apr-2021&type=equities&mode=single';

    // axios.get(url)
    // .then(res => {
    //     console.log(res);
    // });

    // let monAdj = currentDate.format('MMM').toUpperCase();
    // let formatStr = `[https://archives.nseindia.com/content/historical/EQUITIES/]YYYY[/${monAdj}/cm]DD[${monAdj}]YYYY[bhav.csv.zip]`;
    // let url = currentDate.format(formatStr);
    // console.log(url);

    // const params = new URLSearchParams();
    // params.append('requesttype', 'headers');
    // params.append('url', url);

    // let contentDeliveryURL = 'https://script.google.com/macros/s/AKfycby47biuCypNpRWxEppzduv33rj0GXTTFMGeJRPzGooW8oaZ_p4TJVJUiECkJtwK8ZgJ/exec';
    // axios.get(contentDeliveryURL, { params: params })
    // .then(res => {
    //     console.log(res);
    //     console.log(res.data);

    //     if(currentDate.isAfter(endDdate)){
    //         clearInterval(intervalDate);
    //         exitFunction(); // Call Exit Function After Work is Fully Done...
    //     }
    // });
// }