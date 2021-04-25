const moment = require('moment');
const https = require('https');
const fs = require('fs');

class browserAutomatedDownload {
    constructor(startDateStr, endDateStr, basePath) {
        this.startDate = moment(startDateStr);
        this.currentDate = this.startDate;
        this.endDate = moment(endDateStr);
        this.basePath = basePath;
    }

    startDownloadingEqBhav() {
        if(this.currentDate.unix() > this.endDate.unix()){
            return 0;
        }

        let isWeekend = (this.currentDate.day() === 6) || (this.currentDate.day() === 0);
        if(!isWeekend){
            let url = this.currentDate.format("[https://www1.nseindia.com/content/historical/EQUITIES/]YYYY/");
            url += this.currentDate.format("MMM").toUpperCase();
            url += this.currentDate.format("[/cm]DD");
            url += this.currentDate.format("MMM").toUpperCase();
            url += this.currentDate.format("YYYY[bhav.csv.zip]");
            // console.log(url);

            setTimeout(() => {
                this.getFromInternet(url);    
            }, 3000);
        } else {
            this.currentDate.add(1, 'day');
            this.startDownloadingEqBhav();
        }
    }

    getFromInternet(url){
        let that = this;
        let fileName = url.replace(/^.*[\\\/]/, '');
        https.get(url, function(resStrm) {
            console.log("File: ", fileName, "Status Code: ", resStrm.statusCode);
            if(resStrm.statusCode != 200){
                that.currentDate.add(1, 'day');
                that.startDownloadingEqBhav();
                return 0;
            }

            let fullFilePath = that.basePath + fileName;
            let fsStream = fs.createWriteStream(fullFilePath);

            let pipingObj = resStrm.pipe(fsStream);
            pipingObj.on('finish', function(){
                that.currentDate.add(1, 'day');
                that.startDownloadingEqBhav();
            });
        });
    }
}

let basePath = "D:/jData/";
let downloadInstance = new browserAutomatedDownload("2020-07-01", "2020-07-05", basePath);
downloadInstance.startDownloadingEqBhav();
