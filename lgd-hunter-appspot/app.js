const express = require('express');
const app = express();
const http = require('http').Server(app);

app.use(express.static('static'));

app.get('*', function(req, res){
    res.sendFile(__dirname + '/app.html');
});

let PORT = 8080;
http.listen(PORT, function(){
    console.log(`App listening on *:${PORT}`);
});
