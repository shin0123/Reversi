// var http = require('http');

// http.createServer(function (req, res) {
    // res.writeHead(200, {'Content-Type': 'text/html'});
    // res.end('Hello World Test!');
// }).listen(8080);

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

// app.use('/css',express.static(__dirname + '/css'));
app.use('/phaser-3.15.1',express.static(__dirname + '/phaser-3.15.1'));
app.use('/reversi',express.static(__dirname + '/reversi'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/reversi.html');
	//res.sendFile(__dirname + '/index.html');
});

var hasRoom = false;
var idWhite;
var idBlack;
var ipWhite;
var ipBlack;

io.on('connection', function(socket){
	var ip = socket.request.socket.remoteAddress;
	console.log(ip);
	if (ipWhite && ipBlack && ipWhite != ip && ipBlack != ip)
		return;
	if (hasRoom)
	{
		if (socket.id != idWhite)
		{
			idBlack = socket.id;
			ipBlack = ip;
			io.to(idBlack).emit('setplayer', -1);
			io.to(idWhite).emit('setplayer', 1);
		}
	}
	else
	{
		ipWhite = ip;
		idWhite = socket.id;
		hasRoom = true;
	}
	console.log(socket.id);
	socket.join('1');

	socket.on('play', function(data) {
		var clients = io.sockets.adapter.rooms['1'].sockets;   
		for (var clientId in clients)
		{
			var clientSocket = io.sockets.connected[clientId];
			if (clientSocket.id != this.id)
				io.to(clientSocket.id).emit('play', data);
		}
	});
});

server.listen(8081, function(){
    console.log('Listening on '+ server.address().port);
});

// io.on('connection',function(socket){
    // socket.on('newplayer',function(){
        // socket.player = {
            // id: server.lastPlayderID++,
            // x: randomInt(100,400),
            // y: randomInt(100,400)
        // };
        // socket.emit('allplayers',getAllPlayers());
        // socket.broadcast.emit('newplayer',socket.player);

        // socket.on('click',function(data){
            // console.log('click to '+data.x+', '+data.y);
            // socket.player.x = data.x;
            // socket.player.y = data.y;
            // io.emit('move',socket.player);
        // });

        // socket.on('disconnect',function(){
            // io.emit('remove',socket.player.id);
        // });
    // });

    // socket.on('test',function(){
        // console.log('test received');
    // });
// });
