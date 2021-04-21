import express from 'express';

const app = express();
const http = require('http').Server(app);

app.use(express.static(__dirname));

app.get('*', function(req: any, res: any){
    res.sendFile(__dirname + '/index.html');
});

let PORT = 8080;
http.listen(PORT, function(){
    console.log(`App listening on *:${PORT}`);
});