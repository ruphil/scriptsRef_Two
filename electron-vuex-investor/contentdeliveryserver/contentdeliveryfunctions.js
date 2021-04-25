const path = require('path');
const axios = require('axios');
const moment = require('moment');

const handleResponse = (res, date) => {
    // https://archives.nseindia.com/content/historical/EQUITIES/2021/APR/cm09APR2021bhav.csv.zip
    // https://www.nseindia.com/api/reports?archives=[{"name":"CM - Bhavcopy(csv)","type":"archives","category":"capital-market","section":"equities"}]&date=08-Apr-2021&type=equities&mode=single

    let dateObj = moment(date, "YYYY-MM-DD");
    let monAdj = dateObj.format('MMM').toUpperCase();
    let formatStr = `[https://archives.nseindia.com/content/historical/EQUITIES/]YYYY[/${monAdj}/cm]DD[${monAdj}]YYYY[bhav.csv.zip]`;
    let formattedURL = dateObj.format(formatStr);
    let filename = path.basename(formattedURL);
    console.log(formattedURL, filename);

    setTimeout(() => {
        try{
            res.status(418);
            res.send('timeouterror');
        } catch(e) {}
    }, 5000);

    try{
        axios.get(formattedURL, { responseType: 'arraybuffer' })
        .then(data => {
            // console.log(data.data);
            res.set('Content-Type', 'application/zip');
            res.set('Content-Disposition', `attachment; filename=${filename}`);
            res.set('Content-Length', data.length);
            res.send(data.data);
        })
        .catch(err => {
            res.status(418);
            res.send('contenterror')
        });
    } catch (e) {}
    
}

module.exports = { handleResponse };