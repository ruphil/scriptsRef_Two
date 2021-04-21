const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const SH = require('./appSocketHelper');

app.use(express.static('static'));

app.get('*', function(req, res){
    let reqURL = req.originalUrl;
    
    if(reqURL == '/reports'){
        res.sendFile(__dirname + '/template_content_direct/reports.html');
    } else {
        res.sendFile(__dirname + '/appTemplate.html');
    }
});

io.on('connection', function(socket){
    SH.handleSocket(socket);
});

let PORT = 8080;
http.listen(PORT, function(){
    console.log(`App listening on *:${PORT}`);
});