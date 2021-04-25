const puppeteer = require('puppeteer');
const moment = require('moment');

class browserAutomatedDownload {
    constructor(startDateStr, endDateStr) {
        this.startDate = moment(startDateStr);
        this.currentDate = this.startDate;
        this.endDate = moment(endDateStr);
    }

    async startDownloadingEqBhav() {
        const browser = await puppeteer.launch({
            headless: false,
            args:['--user-data-dir=ChromeProfile']
        });

        while (this.currentDate.unix() <= this.endDate.unix()) {
            let isWeekend = (this.currentDate.day() === 6) || (this.currentDate.day() === 0);
            if(!isWeekend){
                let dateStr = this.currentDate.format("DD-MM-YYYY");
                const page = await browser.newPage();
                
                let url = `https://www1.nseindia.com/ArchieveSearch?h_filetype=eqbhav&date=${dateStr}&section=EQ`;
                let selector = 'body > table > tbody > tr > td > a:nth-child(1)';
                
                await page.goto(url);
                await page.waitFor(2000);

                try{
                    await page.waitFor(selector);
                } catch (e) {
                    await page.close();
                    this.currentDate.add(1, 'day');
                    continue;
                }
                    
                let element = await page.$(selector);
                let fileName = await page.evaluate((el) => el.textContent, element);
                console.log(fileName);
                
                await page.click(selector);
                await page.waitFor(3000);
                await page.close();
                
            }
            this.currentDate.add(1, 'day');
        }
        browser.close();
    }
}

let downloadInstance = new browserAutomatedDownload("2020-07-01", "2020-07-05");
downloadInstance.startDownloadingEqBhav();
