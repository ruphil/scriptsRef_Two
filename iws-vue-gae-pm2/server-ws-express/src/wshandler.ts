import WebSocket from "ws";
import { Worker } from 'worker_threads';
import { resolve } from 'path';

export const handleWebSocketConnection = (ws: WebSocket) => {
    ws.on('message', (data: WebSocket.Data) => {
        let cmdObj = JSON.parse(Buffer.from(data.toString(), 'base64').toString());
        console.log(cmdObj);

        if(cmdObj.action == 'download'){
            initiateDownloader(cmdObj.year, ws);
        }
    });
}

const initiateDownloader = (year: any, ws: WebSocket) => {
    let dataObj = { 
        year: year,
        enddate: `${year}-01-10`
    };

    const downloadWorkerPath = resolve(__dirname, '../workers/izipdownloader.js');
    // console.log(downloadWorkerPath);

    const worker = new Worker(downloadWorkerPath, { workerData: dataObj});

    worker.on('message', (msg) => {
        console.log(msg);
        ws.send(msg);
    });
}