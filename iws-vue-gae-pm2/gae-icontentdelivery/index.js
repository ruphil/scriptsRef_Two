const express = require('express');
const moment = require('moment');

const { handleResponse } = require('./helper');

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    let date = req.query.date;
    console.log(date);

    if(date == undefined || !moment(date, 'YYYY-MM-DD', true).isValid()){
        res.status(418);
        res.send('dateerror');
    } else {
        handleResponse(res, date);
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});