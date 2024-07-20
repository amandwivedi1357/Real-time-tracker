const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


const users = {};

io.on('connection', (socket) => {
    console.log('connected:', socket.id);

    
    socket.emit('initial-locations', users);

    
    socket.on('send-location', (data) => {
        users[socket.id] = data;
        io.emit('receive-location', { id: socket.id, ...data });
    });

    
    socket.on('disconnect', () => {
        console.log('disconnected:', socket.id);
        delete users[socket.id];
        io.emit('user-disconnected', socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});