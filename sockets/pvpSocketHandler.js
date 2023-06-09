
const { createLobby, checkLobby, updateLobby, handleWords, joinLobby, calcLobby, updatePlayer, updateGame, removePlayer, getLobby, createNewLobby, getLobbyHint } = require('../scripts/lobbies');
const { updateInvite } = require("../scripts/invites");
const { ObjectId } = require('mongodb');
//Lobbysettings for pre game i.e difficulty, category
let lobbySettings = {}
//keeps track of connected sockets with an object or playerId and lobbyCode
let connectedSockets = new Map();

module.exports = function (io) {
  // set up socket connection
  io.on('connection', (socket) => {
    console.log('a user connected');
    //Create new lobby
    socket.on('createLobby', async (data) => {
      let lobby = null;

      if (data.prevLobby !== "") {
        let lobbyExists = await checkLobby(data.prevLobby, data.playerId)

        if (lobbyExists) {
          lobby = lobbyExists;
        }
      }
      if (lobby === null) {
        let newLobby = await createLobby(data.playerId, data.username);
        if (newLobby) {
          lobby = newLobby;
        }
      }

      lobbySettings[lobby.code] = {
        catSel: "wordsLobbyItem",
        diffSel: 1,
        lobbyDetails: calcLobby({ diff: 1 })
      }

      connectedSockets.set(socket.id, { playerId: data.playerId, lobbyCode: lobby.code, username: data.username });

      await socket.join(lobby.code);
      await socket.emit("lobbyCreated", { message: "Lobby created!", lobby })
      await socket.emit("refreshUi", { lobbySettings: lobbySettings[lobby.code] });
    })

    //Join lobby that is not started and not full
    socket.on('joinLobby', async (data) => {
      socket.emit("loading");
      let lobby = null;
      let lobbyExists = await getLobby(data.lobbyId, data.playerId);
      if (!lobbyExists || lobbyExists.game.startedAt != null || lobbyExists.players.length === 0) {
        await socket.emit("unableToJoin", { message: "Unable to join!", lobby: lobbyExists });
        socket.leave(data.lobbyId);
        connectedSockets.delete(socket.id);
        return;
      }

      let isIn = await lobbyExists.players.filter((p) => p.id.toString() === data.playerId);

      if (isIn.length > 0) {

        lobby = lobbyExists;

      } else {
        let joined = await joinLobby("" + data.lobbyId, data.playerId, data.username);
        if (!joined) return;
        lobby = joined;
      }
      if (lobby === null) {
        await socket.emit("unableToJoin", { message: "No Lobby Found!", lobby: lobbyExists });
        socket.leave(data.lobbyId);
        connectedSockets.delete(socket.id);
        return;
      }

      await updateInvite(data.lobbyId);

      connectedSockets.set(socket.id, { playerId: data.playerId, lobbyCode: data.lobbyId, username: data.username });
      await socket.join(data.lobbyId);
      let player = await lobby.players.filter((p) => p.id.toString() === data.playerId);
      await socket.emit("joined", { message: "You joined!", lobby, player: player[0] })
      await socket.emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyId] })
      await io.to(lobby.code).emit("lobbyJoined", { message: "Someone has joined!", lobby })
    })
    //Rejoin lobby that you are in and that is not started, mainly for page refreshes
    socket.on('reJoinLobby', async (data) => {

      socket.emit("loading");
      connectedSockets.set(socket.id, { playerId: data.playerId, lobbyCode: data.lobbyCode, username: data.username });

      let lobbyExists = await checkLobby(data.lobbyCode, data.playerId)

      if (!lobbyExists) {
        await socket.emit("unableToJoin", { message: "Lobby not found!", lobby: lobbyExists });
        socket.leave(data.lobbyId);
        connectedSockets.delete(socket.id);
        return;
      }
      if (lobbyExists.game.startedAt != null) {
        let newLobby = lobbyExists;

        let newPlayers = await newLobby.players.filter((p) => p.id.toString() != data.playerId);

        let p = await newLobby.players.filter((p) => p.id.toString() === data.playerId);

        if (newPlayers.length > 0) {

          if (p[0].isCreator) {
            newPlayers[0].isCreator = true;
          }

          newLobby.players = newPlayers;

          socket.to(data.lobbyId).emit("refreshLobby", newLobby);
        }

        await socket.emit("unableToJoin", { message: "You left the game!", lobby: lobbyExists });
        removePlayer({ playerId: data.playerId, lobbyCode: data.lobbyCode })
        socket.leave(data.lobbyId);

        return;
      }
      await socket.join(data.lobbyCode);
      if (!lobbySettings.hasOwnProperty(data.lobbyCode)) lobbySettings[data.lobbyCode] = {
        catSel: "wordsLobbyItem",
        diffSel: 1,
        lobbyDetails: calcLobby({ diff: 1 })
      }

      let player = await lobbyExists.players.filter((p) => p.id.toString() === data.playerId);

      await socket.emit("joined", { message: "You joined!", lobby: lobbyExists, player: player[0] })
      await socket.to(data.lobbyCode).emit("lobbyJoined", { message: "Someone has joined!", lobby: lobbyExists })
      await socket.emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] })
    });
    //Lobby creator difficulty select, emits event to control all clients
    socket.on('selDiff', (data) => {
      lobbySettings[data.lobbyCode].diffSel = data.diff;
      lobbySettings[data.lobbyCode].lobbyDetails = calcLobby({ diff: data.diff });
      io.to(data.lobbyCode).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] })
    })
    //Lobby creator category select, emits event to control all clients
    socket.on('changeCatSel', (data) => {
      lobbySettings[data.lobbyId].catSel = data.selId;
      io.to(data.lobbyId).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyId] })
    })

    //Start the game
    socket.on('start', async (lobby) => {

      let tempLobby = await getLobby(lobby.lobbyId);

      if (!tempLobby) {
        socket.emit("alert", "No lobby found!");
        return;
      }

      if (tempLobby.players.length != 2) {
        socket.emit("alert", "Two players are needed!");
        return;
      }

      io.to(lobby.lobbyId).emit("loading");

      let wordsData = await handleWords(lobby.catSel, lobby.lobbyId);
      const obj = {
        code: lobby.lobbyId,
        game: {
          words: wordsData,
          startedAt: Date.now(),
          type: lobby.catSel,
          totalDuration: lobby.lobbyDetails.time,
          difficulty: lobby.diffSel,
          points: lobby.lobbyDetails.points,
        }
      }

      let updated = await updateLobby(obj);

      await io.to(lobby.lobbyId).emit("refreshLobby", updated);
      await io.to(lobby.lobbyId).emit("start", { wordData: wordsData[0], time: lobby.lobbyDetails.time })
    })


    socket.on("getHint", async (data) => {

      if (data.num < 1 || data.num > 2) return;

      let hints = await getLobbyHint(data.lobbyCode, data.w);

      let h = data.num === 1 ? hints.hint2 : hints.hint1

      socket.emit("getHint", h);

    })


    socket.on("refresh", (data) => {
      socket.join(data.lobbyCode);
      io.to(data.lobbyCode).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] })
    })

    //Handle the players guess after it has been verified
    socket.on('handlePlayerGuess', async (data) => {

      const datetime = data.lobby.game.startedAt;  // replace with your datetime timestamp
      const now = Date.now();       // get the current time

      if (now - datetime > (data.lobby.game.totalDuration * 1000) || data.lobby.game.endedAt != null) {
        socket.emit("alert", `More than ${data.lobby.game.totalDuration} seconds have passed.`);
        return;
      }
      if (data.player.wordsGuessed.length >= data.lobby.game.words.length) {
        let np = data.player;
        np.didComplete = true;
        np.isWinner = true;
        let updateP = await updatePlayer(data.lobby.code, np);
        await updateGame({
          isComplete: true,
          endedAt: Date.now(),
          code: data.lobby.code
        })
        const index = await updateP.players.findIndex(player => player.id.toString() === data.player.id);

        await socket.to(data.lobby.code).emit("gameOver", "Player " + (index + 1) + " has won!")
        await socket.emit("handleWinner", { points: updateP.game.points })
        await io.to(data.lobby.code).emit("refreshLobby", updateP);
        await setTimeout(async () => {
          // let playerIds = await updateP.players.map(player => player.id.toString());

          let newLobby = await createNewLobby(data.lobby.players);
          delete lobbySettings[data.lobby.code];
          lobbySettings[newLobby.code] = {
            catSel: "wordsLobbyItem",
            diffSel: 1,
            lobbyDetails: calcLobby({ diff: 1 })
          }
          await io.to(data.lobby.code).emit("newLobby", { lobbySettings: lobbySettings[newLobby.code], lobby: newLobby });
        })
      } else {
        let updateP = await updatePlayer(data.lobby.code, data.player);
        let player = await updateP.players.filter((p) => p.id.toString() === data.player.id);
        let next = updateP.game.words[player[0].wordsGuessed.length]

        await socket.emit('nextWord', { player: player[0], wordData: next });
        await io.to(data.lobby.code).emit("refreshLobby", updateP);
      }

    })
    //Time has ran out
    socket.on('timesUp', async (data) => {
      // await socket.emit("joined", { message: "You joined!", lobby: lobbyExists, player: player[0] })
      if (!lobbySettings.hasOwnProperty(data.lobby.code)) return;

      if (!data.player.isCreator) return;

      await updateGame({
        isComplete: true,
        endedAt: Date.now(),
        code: data.lobby.code
      })

      await io.to(data.lobby.code).emit("onTimesUp");

      await setTimeout(async () => {
        // let playerIds = await updateP.players.map(player => player.id.toString());

        let newLobby = await createNewLobby(data.lobby.players);
        delete lobbySettings[data.lobby.code];
        lobbySettings[newLobby.code] = {
          catSel: "wordsLobbyItem",
          diffSel: 1,
          lobbyDetails: calcLobby({ diff: 1 })
        }
        await io.to(data.lobby.code).emit("newLobby", { lobbySettings: lobbySettings[newLobby.code], lobby: newLobby });
      })

    })
    //Leave the lobby
    socket.on('leaveLobby', async (data) => {

      let newLobby = data.lobby;

      let players = await newLobby.players.filter((p) => p.id.toString() !== data.player.id);


      if (players.length > 0) {

        if (data.player.isCreator) {
          players[0].isCreator = true;
          await updatePlayer(newLobby.code, players[0]);

        }

        newLobby.players = players;

        await socket.to(newLobby.code).emit("refreshLobby", newLobby);

        await socket.leave(newLobby.code);

      } else {
        if (lobbySettings[newLobby.code]) delete lobbySettings[newLobby.code];
      }


      const { playerId, lobbyCode } = connectedSockets.get(socket.id) || {};

      if (playerId === undefined || lobbyCode === undefined) return;

      connectedSockets.delete(socket.id);

      removePlayer({ playerId, lobbyCode })


    })

    //Disconnect the player from the lobby
    socket.on('disconnect', () => {


      const { playerId, lobbyCode } = connectedSockets.get(socket.id) || {};

      if (playerId === undefined || lobbyCode === undefined) return;

      connectedSockets.delete(socket.id);


      // if (playerId != undefined && lobbyCode != undefined) {
      //   removePlayer({ playerId, lobbyCode })
      // }

    })
  });



  // return the io object
  return io;
}
