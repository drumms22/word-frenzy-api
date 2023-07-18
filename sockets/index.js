
const pvpSocketHandler = require('./pvpSocketHandler');
const spSocketHandler = require('./singlePlayer');
const general = require('./general');
let connectedSockets = new Map();

module.exports = function (io) {
  const socketIO = io.of('/');
  const singleplayerIO = io.of('/singleplayer');
  const pvpIO = io.of('/pvp');
  socketIO.on('connection', (socket) => {

    socket.on('connectUser', (data) => {
      connectedSockets.set(socket.id, { playerId: data.playerId, username: data.username });
      console.log('A user connected!');
    })

    general(io, socket);


    socket.on('disconnect', () => {

      const { playerId, username } = connectedSockets.get(socket.id) || {};

      if (playerId === undefined || username === undefined) return;
      connectedSockets.delete(socket.id);
    })

  })
  singleplayerIO.on('connection', (socket) => {
    console.log('A user connected to singleplayer mode!');
    spSocketHandler(io, socket, connectedSockets)
  });
  pvpIO.on('connection', (socket) => {
    console.log("pvp connected");
    pvpSocketHandler(io, socket, connectedSockets);
    // ...
  });

}