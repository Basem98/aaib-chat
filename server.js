const http = require('http');
const express = require('express');
const { Server: Socket } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
/* Create an instance of HTTP (that works with socket.io) using an express app */
const server = http.createServer(app);
/* Pass the http express app to Socket to be used as its listener */
const socketConnection = new Socket(server);
const PORT = process.env.PORT || 5500;

let users = JSON.parse(fs.readFileSync('users.json'));

/* ------------ Parse incoming body data ------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ------------ Host public folder for clientside ------------ */
app.use(express.static(path.resolve(__dirname, './public')));


app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, './public/home.html')));

app.get('/signin', (req, res) => {
  /* Get from the request url the letters following the username query string */
  const username = decodeURIComponent(req.url.split('=')[1]);
  users.push(username);
  fs.writeFileSync('users.json', JSON.stringify(users));
  res.redirect('/chat.html');
});

/* ------------ Listen on any connection to your opened socket ------------ */
socketConnection.on('connection', (socket) => {
  const socketUser = socket.handshake.query.username;
  /* Announce to all the connected sockets that a new connection is made */
  if (socketUser && !users.includes(socketUser)) {
    users.push(socketUser);
    fs.writeFileSync('users.json', JSON.stringify(users));
  }
  socket.emit('announce', users);
  socket.broadcast.emit('announce', users);

  socket.on('message', (message) => {
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('disconnected')
    users = users.filter(user => user != socketUser);
    fs.writeFileSync('users.json', JSON.stringify(users));
    socket.broadcast.emit('announce', users);
  });
});




server.listen(PORT, () => console.log(`Server is now listening on http://localhost:${PORT}`));