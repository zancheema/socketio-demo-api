const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3000

// Start the server at port 3000
var server = http.createServer(app);

app.get('/', (req, res) => {
	res.send('<h1>Socket.io app is live!</h1>');
});

server.listen(PORT, () => console.log(`listening to server on port ${PORT}`));

// Create a Socket.IO instance, passing it our server
var io = socketio.listen(server)

// When a client connects we setup some event listeners
io.on('connection', socket => {

	socket.on('subscribe', subscriber => {
		console.log('subscribe triggered');

		const data = JSON.parse(subscriber);
		const name = data.name;
		const chatRoom = data.chatRoom;

		socket.join(chatRoom);

		io.to(chatRoom).emit("newSubscriber", name);
	});

	socket.on('sendMessage', chatMessage => {
		console.log(`sendMessage triggered: ${chatMessage}`);
		// convert JSON string to object
		const data = JSON.parse(chatMessage);
		// no need to user JSON.stringify() 
		// because chatMessage is already a JSON string
		io.to(data.chatRoom).emit('newMessage', chatMessage);
	});

	socket.on('unsubscribe', unsubscriber => {
		const data = JSON.parse(unsubscriber);
		const name = data.name;
		const chatRoom = data.chatRoom;

		socket.leave(chatRoom);
		
		io.to(chatRoom).emit('newUnsubscriber', name);
	});

	socket.on('disconnect', () => {
		console.log(`Client ${socket.id} | Disconnected`);
	});

    console.log(`Client ${socket.id} | Connected`);
});