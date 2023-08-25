
const { handleWords, calcLobby, updatePlayer, updateGame, handleHints, updateEntireLobby, getLobbyHint, createTempLobby, saveLobby, getPlayedTogether } = require('../scripts/lobbies');
const { updateInvite, getAllNotIn, saveInvite, getInvite } = require("../scripts/invites");
const { ObjectId } = require('mongodb');
const { getUser, updateUser, calcSpeed, batchUpdateStats, batchCalcSpeeds, getAllUsers } = require('../scripts/users');
const { checkGuess, validateGuess } = require('../scripts/guesses');
const { saveReward } = require('../scripts/rewards');
//Lobbysettings for pre game i.e difficulty, category
let lobbySettings = {}
//keeps track of connected sockets with an object or playerId and lobbyCode
let connectedSockets = new Map();

let gameStates = {};

let lobbyDis = {};

module.exports = function (io, socket, connUsers) {
  // set up socket connection
  //Create new lobby


  const startTime = (playerId, socketId) => {
    gameStates[playerId].timer = setInterval(() => {
      gameStates[playerId].time--;

      if (gameStates[playerId].time <= 0) {
        clearInterval(gameStates[playerId].timer);
        io.of('/pvp').to(socketId).emit('updateTime', 0);
        handleTimesUp(playerId, socketId)
        return;
      }

      io.of('/pvp').to(socketId).emit('updateTime', gameStates[playerId].time);
    }, 1000);
  }

  const calcPlayerStats = (playerId, socketId, lobbyId) => {
    let timeAcc = gameStates[playerId].ogTime - gameStates[playerId].time;

    if (!gameStates[playerId].failed) {
      connectedSockets.get(socketId).gameData.totalPoints += gameStates[playerId].wordsData[gameStates[playerId].currentPos].points;
      connectedSockets.get(socketId).gameData.totalCharCount += gameStates[playerId].currentWord.split('').join('').length;
      connectedSockets.get(socketId).gameData.totalWordsCompleted++;
      gameStates[playerId].player.wordsGuessed.push(gameStates[playerId].currentWord);
      gameStates[playerId].player.pointsAquired += gameStates[playerId].wordsData[gameStates[playerId].currentPos].points;
    }
    connectedSockets.get(socketId).gameData.totalTimeSpent += timeAcc;
    gameStates[playerId].player.timeSpent += timeAcc;
    // lobbySettings[lobbyId].gameStates[playerId] = gameStates[playerId];
  }

  const handleNextWord = (playerId, lobbyId) => {
    gameStates[playerId].currentPos++;
    let prevWord = gameStates[playerId].currentWord;
    gameStates[playerId].currentWord = gameStates[playerId].wordsData[gameStates[playerId].currentPos].word;
    gameStates[playerId].time = gameStates[playerId].wordsData[gameStates[playerId].currentPos].time;
    gameStates[playerId].ogTime = gameStates[playerId].wordsData[gameStates[playerId].currentPos].time;
    //lobbySettings[lobbyId].gameStates[playerId] = gameStates[playerId];
    startTime(playerId, socket.id);
    socket.emit('nextWord', { nextWord: gameStates[playerId].currentWord, prevWord });
  }

  const checkOOP = (correctLetters, wordLetters, outOfPlaceLetters) => {

    let newOOP = [];

    for (let i = 0; i < outOfPlaceLetters.length; i++) {
      let wordCount = wordLetters.filter((l) => l === outOfPlaceLetters[i]);
      let corrCount = correctLetters.filter((l) => l === outOfPlaceLetters[i]);
      let oopCount = outOfPlaceLetters.filter((l) => l === outOfPlaceLetters[i]);

      if (corrCount.length < wordCount.length && oopCount.length <= (wordCount.length - corrCount.length)) {
        newOOP.push(outOfPlaceLetters[i])
      }

    }

    //combine outOfPlaceLetters with newOOP not duplicating letters

    return newOOP;

  }
  const combineArr = (arr1, arr2) => {
    const combined = [...arr1, ...arr2]; // Combine the arrays
    const unique = [...new Set(combined)];
    return unique;
  }

  const handleTimesUp = async (playerId, socketId) => {
    let stillIn = 0;
    //Check if there are still other players active
    //A player fails if their timer reaches zero
    gameStates[playerId].failed = true;
    let lobbyCode = connectedSockets.get(socketId).lobbyCode;
    lobbySettings[lobbyCode].lobby.players.forEach(p => {
      if (p.id !== playerId && !gameStates[p.id].failed) {
        stillIn++;
      }
    })

    calcPlayerStats(playerId, socketId, lobbyCode);

    if (stillIn > 0) {
      io.of('/pvp').to(socketId).emit('timesUp', { words: gameStates[playerId].wordsData });
    } else {
      lobbySettings[lobbyCode].completed = true;
      //If all other players have failed, show times up screen
      //Updated player: updatePlayerData(playerId)
      await handleGameEnd(lobbyCode);
      io.of('/pvp').to(lobbyCode).emit('gameOver', { words: gameStates[playerId].wordsData });
      setTimeout(() => endScreenTimer(lobbyCode), 5000);
    }

  }

  //SinglePlayerUpdate
  const handlePlayerUpdate = async (playerId, lobbyCode) => {

    calcPlayerStats(playerId, socket.id, lobbyCode);
    await updatePlayer(lobbyCode, gameStates[playerId].player);
    let gd = JSON.stringify(connectedSockets.get(socket.id).gameData);
    await updateUser({
      id: playerId,
      data: gd,
    })

    let updated = await calcSpeed(playerId);

    if (updated) {
      connectedSockets.get(socket.id).gameData = updated.gameData;
      socket.emit('updateStats', updated.gameData)
    }

  }
  //MultiplePlayersUpdate
  const handlePlayersUpdate = async (lobbyCode) => {

    let playersStats = [];
    let playerSockets = {};

    await lobbySettings[lobbyCode].lobby.players.forEach(p => {

      let socketId;
      for (const [id, socketData] of connectedSockets.entries()) {
        if (socketData.playerId === p.id) {
          socketId = id;
          break;
        }
      }

      if (socketId) {
        let newDataObj = {
          id: p.id,
          data: JSON.stringify(connectedSockets.get(socketId).gameData),
        }
        playersStats.push(newDataObj);
        playerSockets[p.id] = socketId;
      }

    })

    //batch update using the playerstats
    await batchUpdateStats(playersStats);

    let updatedSpeeds = await batchCalcSpeeds(playersStats);

    if (updatedSpeeds.length > 0) {
      updatedSpeeds.map((p) => {
        connectedSockets.get(playerSockets[p.id]).gameData.speedData = p.gameData.speedData;
        io.of('/pvp').to(playerSockets[p.id]).emit('updateStats', connectedSockets.get(playerSockets[p.id]).gameData);
      })
    }

  }

  const handleGameEnd = async (lobbyCode) => {

    let updatedP = [];

    await lobbySettings[lobbyCode].lobby.players.forEach(p => {
      updatedP.push(gameStates[p.id].player);
    })
    lobbySettings[lobbyCode].lobby.players = updatedP;
    lobbySettings[lobbyCode].lobby.game.isComplete = true;
    lobbySettings[lobbyCode].lobby.game.endedAt = Date.now();
    await updateEntireLobby(lobbySettings[lobbyCode].lobby);

    await handlePlayersUpdate(lobbyCode);

  }

  const clearAllTimers = (playerId, lobbyId) => {
    lobbySettings[lobbyId].lobby.players.forEach(p => {
      if (p.id !== playerId && gameStates[p.id] && gameStates[p.id].timer !== null) {
        clearInterval(gameStates[p.id].timer);
      }
    })
  }

  const endScreenTimer = (lobbyCode) => {

    let time = 16;

    io.of('/pvp').to(lobbyCode).emit('startEndScreen');

    lobbySettings[lobbyCode].endScreen = setInterval(() => {

      time--;
      if (time < 1) {
        clearInterval(lobbySettings[lobbyCode].endScreen);
        lobbySettings[lobbyCode].endScreen = null;
        io.of('/pvp').to(lobbyCode).emit('endScreenTimer', 0);
        initNewLobby(lobbySettings[lobbyCode], lobbyCode);
        return;
      }

      io.of('/pvp').to(lobbyCode).emit('endScreenTimer', time);
    }, 1000);

  }

  const initNewLobby = async (oldSettings, preLobbyCode) => {

    delete lobbySettings[preLobbyCode];

    let lobby = await createTempLobby(oldSettings.creator.id, oldSettings.creator.username, {});

    lobby.players = oldSettings.lobby.players.map((p) => new Object({
      id: p.id,
      username: p.username,
      isWinner: false,
      timeSpent: 0,
      didComplete: false,
      wordsGuessed: [],
      isCreator: p.isCreator,
      pointsAquired: 0
    }));

    lobbySettings[lobby.code] = {
      lobby: lobby,
      creator: oldSettings.creator,
      gameStates: {},
      catSel: "wordsItem",
      diffSel: 1,
      maxPlayers: 2,
      wordCount: 3,
      currentWord: "",
      mode: "Frenzy",
      playerProg: {},
      completed: false,
      endScreen: null
    }

    //Loop through each player in the lobby
    lobbySettings[lobby.code].lobby.players.forEach(p => {
      //Get socket Id of player from the connected sockets
      let socketId;
      for (const [id, socketData] of connectedSockets.entries()) {
        if (socketData.playerId === p.id) {
          socketId = id;
          break;
        }
      }
      //If there is an Id, update the lobby code with new lobby code
      if (socketId) {
        connectedSockets.get(socketId).lobbyCode = lobby.code;
      }
      //If the player has a game state, delete it, game states are only used during a game
      if (gameStates[p.id]) delete gameStates[p.id];
      //Update player progress to 0
      lobbySettings[lobby.code].playerProg[p.id] = 0;
      //Leave old room, Join new room using the new lobby code
      const nSocket = io.of('/pvp').sockets.get(socketId);
      if (nSocket) {
        nSocket.leave(preLobbyCode);
        nSocket.join(lobby.code);
      }
    });


    io.of('/pvp').to(lobby.code).emit('newLobby', { lobbySettings: lobbySettings[lobby.code], lobby: lobbySettings[lobby.code].lobby });

  };

  const handlePlayerDisc = (playerSocket, lobby, playerId, kicked) => {

    let newLobby = lobby;

    if (newLobby.players.length > 1) {
      let newPlayers = newLobby.players.filter((p) => p.id != playerId);

      let p = newLobby.players.filter((p) => p.id === playerId);
      if (p[0].isCreator) {
        newPlayers[0].isCreator = true;
      }

      newLobby.players = newPlayers;

      lobbySettings[newLobby.code].lobby = lobby;

      playerSocket.to(newLobby.code).emit("refreshLobby", lobbySettings[newLobby.code]);
      playerSocket.to(newLobby.code).emit("lobbyLeaveSound");
      if (!p[0].isCreator && kicked) {
        socket.emit('alert', `${p[0].username} has been kicked!`);
      }


    } else {
      delete lobbySettings[newLobby.code];
      if (newLobby.game.startedAt !== null) {

        updateGame({
          isComplete: true,
          endedAt: Date.now(),
          code: newLobby.code
        });

      }
    }
    playerSocket.leave(lobby.code);
    connectedSockets.delete(playerSocket.id);
  }

  //SOCKET HANDLERS START HERE -------------------------------------------------------------------------------------------------

  socket.on('createLobby', async (data) => {

    let lobby = null;

    if (data.prevLobby !== "" && lobbySettings[prevLobby]) {

      lobby = lobbySettings[prevLobby].lobby;

    }
    if (lobby === null) {
      lobby = await createTempLobby(data.playerId, data.username, {});
    }

    lobbySettings[lobby.code] = {
      lobby,
      creator: lobby.players[0],
      gameStates: {},
      catSel: "wordsItem",
      diffSel: 1,
      maxPlayers: 2,
      wordCount: 3,
      currentWord: "",
      mode: "Frenzy",
      playerProg: {},
      completed: false,
      endScreen: null
    }

    lobbySettings[lobby.code].playerProg[data.playerId] = 0;

    let e = await getUser(data.playerId);

    connectedSockets.set(socket.id, { playerId: data.playerId, lobbyCode: lobby.code, username: data.username, gameData: e.gameData });

    socket.join(lobby.code);

    socket.emit("lobbyCreated", lobbySettings[lobby.code])
    socket.emit("refreshUi", { lobbySettings: lobbySettings[lobby.code] });
  })
  socket.on('getInviteList', async (data) => {

    let users = await getAllNotIn(data.playerId);

    let inLobbyIds = await lobbySettings[data.lobbyCode].lobby.players.map((p) => p.id.toString())

    let filteredList = await users.filter((u) => !inLobbyIds.includes(u._id.toString()))

    socket.emit('getInviteList', filteredList);
  })

  socket.on('sendInvite', async (data) => {

    let saved = await saveInvite(data.lobbyCode, data.playerId, data.playerTo);

    if (!saved) {
      socket.emit('alert', "Invite not sent!");
      return;
    }

    let socketId;
    for (const [id, socketData] of connUsers.entries()) {
      if (socketData.playerId === data.playerTo) {
        socketId = id;
        break;
      }
    }

    if (socketId) {
      let invites = await getInvite({ playerTo: data.playerTo });

      io.of('/').to(socketId).emit('getInvites', invites.filter((i) => !i.accepted));
    }

    socket.emit('sendInvite', { playerTo: data.playerTo });

  })

  //Join lobby that is not started and not full
  socket.on('joinLobby', async (data) => {

    socket.emit("loading");
    let lobby = null;
    let lobbyExists = lobbySettings[data.lobbyId];
    if (!lobbyExists || lobbyExists.lobby.game.startedAt != null || lobbyExists.lobby.players.length === 0) {
      socket.emit("unableToJoin", { message: "Unable to join!" });
      socket.leave(data.lobbyId);
      connectedSockets.delete(socket.id);
      return;
    }

    let isIn = lobbyExists.lobby.players.filter((p) => p.id === data.playerId);

    if (isIn.length > 0) {

      lobby = lobbyExists.lobby;

    } else {

      lobbyExists.lobby.players.push({
        id: data.playerId,
        username: data.username,
        isWinner: false,
        timeSpent: 0,
        didComplete: false,
        wordsGuessed: [],
        isCreator: false,
        pointsAquired: 0
      })
      lobby = lobbyExists.lobby;
      lobbySettings[data.lobbyId].lobby = lobby;
    }

    updateInvite(data.lobbyId);

    let e = await getUser(data.playerId);

    lobbySettings[data.lobbyId].playerProg[data.playerId] = 0;

    connectedSockets.set(socket.id, { playerId: data.playerId, lobbyCode: data.lobbyId, username: data.username, gameData: e.gameData });
    socket.join(data.lobbyId);
    let player = lobby.players.filter((p) => p.id === data.playerId);
    socket.emit("joined", { message: "You joined!", lobby, player: player[0] })
    socket.emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyId] });
    io.of('/pvp').to(data.lobbyId).emit("refreshLobby", lobbySettings[data.lobbyId]);
    io.of('/pvp').to(data.lobbyId).emit("lobbyJoinSound");
  })
  //Rejoin lobby that you are in and that is not started, mainly for page refreshes
  socket.on('reJoinLobby', async (data) => {

    if (lobbyDis[data.lobbyCode]) {
      clearTimeout(lobbyDis[data.lobbyCode].timer);
      delete lobbyDis[data.lobbyCode];
    }

    socket.emit("loading");
    const socketConnected = [...connectedSockets.values()].find(socketData => socketData.playerId === data.playerId);

    if (socketConnected) {
      let socketId;
      for (const [id, socketData] of connectedSockets.entries()) {
        if (socketData.playerId === data.playerId) {
          socketId = id;
          break;
        }
      }
      connectedSockets.set(socket.id, { ...socketConnected });
      connectedSockets.delete(socketId)
    } else {
      let e = await getUser(data.playerId);
      connectedSockets.set(socket.id, { playerId: data.playerId, lobbyCode: data.lobbyCode, username: data.username, gameData: e.gameData });
    }


    let lobbyExists = lobbySettings[data.lobbyCode];

    if (!lobbyExists) {
      socket.emit("unableToJoin", { message: "Lobby not found!" });
      socket.leave(data.lobbyCode);
      connectedSockets.delete(socket.id);
      return;
    }
    if (lobbyExists.lobby.game.startedAt != null) {
      handlePlayerDisc(socket, lobbyExists, data.playerId, false);
      connectedSockets.delete(socket.id);
      socket.emit("unableToJoin", { message: "You left the game!", lobby: lobbyExists.lobby });
      return;
    }
    socket.join(data.lobbyCode);

    lobbySettings[data.lobbyCode].playerProg[data.playerId] = 0;

    let player = lobbyExists.lobby.players.filter((p) => p.id === data.playerId);

    socket.emit("joined", { message: "You joined!", lobby: lobbyExists.lobby, player: player[0] })
    socket.emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] });
    socket.emit("refreshLobby", lobbySettings[data.lobbyCode]);
  });
  //Lobby creator difficulty select, emits event to control all clients
  socket.on('selDiff', (data) => {
    lobbySettings[data.lobbyCode].diffSel = data.diff;
    io.of('/pvp').to(data.lobbyCode).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] })
  })
  //Lobby creator category select, emits event to control all clients
  socket.on('changeCatSel', (data) => {
    lobbySettings[data.lobbyId].catSel = data.selId;
    io.of('/pvp').to(data.lobbyId).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyId] })

  })
  //Lobby creator change max players, emits event to control all clients
  socket.on('changeMaxPlayers', (data) => {
    let max = data.maxPlayers < 2 ? 2 : data.maxPlayers > 8 ? 8 : data.maxPlayers;
    lobbySettings[data.lobbyCode].maxPlayers = max;
    io.of('/pvp').to(data.lobbyCode).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] })
  })
  //Lobby creator category select, emits event to control all s
  socket.on('changeWordCount', (data) => {

    lobbySettings[data.lobbyCode].wordCount = data.wordCount;
    io.of('/pvp').to(data.lobbyCode).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] })
  })

  socket.on('getPlayedTogether', async (data) => {
    let player2 = lobbySettings[data.lobbyCode].lobby.players.filter((p) => p.id === data.player2Id);
    if (player2.length > 0) {
      let together = await getPlayedTogether(data.playerId, data.player2Id);
      const socketConnected = [...connectedSockets.values()].find(socketData => socketData.playerId === data.player2Id);
      socket.emit('getPlayedTogether', { together, player2Data: socketConnected, player2Id: data.player2Id });
    }
  })

  //Start the game
  socket.on('start', async (data) => {

    let lobbyExists = lobbySettings[data.lobbyId];

    if (!lobbyExists) {
      socket.emit("unableToJoin", { message: "Lobby not found!", lobby: lobbyExists.lobby });
      socket.leave(data.lobbyId);
      connectedSockets.delete(socket.id);
      return;
    }

    // if (lobbyExists.lobby.players.length < 2 || lobbyExists.lobby.players.length > 8) {
    //   socket.emit("alert", "Player count must be 2-8!");
    //   return;
    // }

    io.of('/pvp').to(data.lobbyId).emit("loading");

    let speed = lobbyExists.diffSel === 0 ? 35 : lobbyExists.diffSel === 2 ? 12 : lobbyExists.diffSel === 3 ? 5 : 20;

    let wordsData = await handleWords(lobbyExists.catSel, data.wordCount, data.mode, speed, lobbyExists.diffSel);

    await handleHints(lobbyExists.catSel, wordsData, data.lobbyId);
    let time = wordsData.reduce((acc, obj) => acc + obj.time, 0);
    let points = wordsData.reduce((acc, obj) => acc + obj.points, 0);
    let reward = await saveReward("Points", "Reward for completing a pvp", points, "none");
    lobbyExists.lobby.game = {
      words: wordsData,
      startedAt: Date.now(),
      type: lobbyExists.catSel,
      difficulty: lobbyExists.diffSel,
      points: points,
      mode: lobbyExists.mode,
      endedAt: null,
      maxDuration: time,
      isComplete: false,
      maxPlayers: lobbyExists.maxPlayers,
      rewards: [reward._id.toString()],
      category: lobbyExists.catSel,
    }
    lobbySettings[data.lobbyId] = lobbyExists;
    await saveLobby(lobbyExists.lobby);
    io.of('/pvp').to(lobbyExists.lobby.code).emit("refreshLobby", lobbySettings[data.lobbyId]);
    io.of('/pvp').to(lobbyExists.lobby.code).emit("start")
    setTimeout(() => {
      io.of('/pvp').to(lobbyExists.lobby.code).emit("startGame", { word: wordsData[0].word });
      lobbyExists.lobby.players.forEach(p => {
        let socketId;
        for (const [id, socketData] of connectedSockets.entries()) {
          if (socketData.playerId === p.id) {
            socketId = id;
            break;
          }
        }

        gameStates[p.id] = {
          wordsData,
          player: p,
          currentPos: 0,
          endPos: wordsData.length - 1,
          time: wordsData[0].time,
          ogTime: wordsData[0].time,
          currentWord: wordsData[0].word,
          timer: null,
          hintsUsed: 0,
          failed: false,
        }

        startTime(p.id, socketId);
      })

    }, 3000)
  })

  socket.on("checkGuess", async (data) => {
    if (lobbySettings[data.lobbyCode].completed) return;
    if (data.guess === gameStates[data.playerId].currentWord) {
      clearInterval(gameStates[data.playerId].timer);
      if (gameStates[data.playerId].currentPos >= gameStates[data.playerId].endPos) {
        clearAllTimers(data.playerId, data.lobbyCode);
        calcPlayerStats(data.playerId, socket.id, data.lobbyCode);
        connectedSockets.get(socket.id).gameData.totalChallengesCompleted++;
        lobbySettings[data.lobbyCode].completed = true;
        gameStates[data.playerId].player.didComplete = true;
        gameStates[data.playerId].player.isWinner = true;
        await handleGameEnd(data.lobbyCode);
        //connectedSockets.set(socket.id, { playerId: data.playerId, lobbyCode: lobby.code, username: data.username, gameData: e.gameData });
        let winner = lobbySettings[data.lobbyCode].lobby.players.filter((p) => p.id === data.playerId);
        for (const [id, socketData] of connectedSockets.entries()) {
          if (socketData.playerId != data.playerId && socketData.lobbyCode === data.lobbyCode) {

            let notComplete = gameStates[socketData.playerId].wordsData.map((wd) => wd.word).slice(gameStates[socketData.playerId].currentPos);
            socket.to(id).emit("loser", { notComplete, winner: winner[0] })
            break;
          }
        }
        socket.emit('winner', { word: gameStates[data.playerId].currentWord });
        setTimeout(() => endScreenTimer(data.lobbyCode), 5000);
        return;
      } else {
        lobbySettings[data.lobbyCode].playerProg[data.playerId]++;
        handlePlayerUpdate(data.playerId, data.lobbyCode);
        io.of('/pvp').to(data.lobbyCode).emit("updatePlayerProgress", lobbySettings[data.lobbyCode].playerProg);
        handleNextWord(data.playerId);
      }
      // let player = await updateP.players.filter((p) => p.id.toString() === data.player.id);

    } else {

      let validate = await validateGuess(data.guess, lobbySettings[data.lobbyCode].catSel, data.correctLetters, gameStates[data.playerId].currentWord);

      if (!validate) {
        socket.emit('invalidGuess');
        return;
      }

      let check = checkGuess(gameStates[data.playerId].currentWord, data.guess);
      let combined = combineArr(data.outOfPlaceLetters, check.outOfPlaceLetters);
      check.outOfPlaceLetters = checkOOP(check.correctLetters, gameStates[data.playerId].currentWord.split(''), combined);
      socket.emit('checkGuess', check, gameStates[data.playerId].currentWord);

    }

  })

  socket.on("getHint", async (data) => {

    gameStates[data.playerId].hintsUsed++;

    if (gameStates[data.playerId].hintsUsed < 3) {
      let hints = await getLobbyHint(data.lobbyCode, gameStates[data.playerId].wordsData[gameStates[data.playerId].currentPos].word);

      let h = gameStates[data.playerId].hintsUsed === 2 ? hints.hint2 : hints.hint1

      if (gameStates[data.playerId].hintsUsed === 1) {
        socket.emit("getHint", { hint: h, hintsUsed: gameStates[data.playerId].hintsUsed, completed: data.num < 1 ? true : false });
      } else {
        socket.emit("hintsComplete", h);
      }

    } else {
      socket.emit("hintsComplete", "");
    }

  })


  socket.on("refresh", (data) => {
    socket.join(data.lobbyCode);
    io.of('/pvp').to(data.lobbyCode).emit("refreshUi", { lobbySettings: lobbySettings[data.lobbyCode] })
  })
  //  pvpSocket.emit('kickPlayer', {playerId, lobbyCode, kickedId});
  socket.on('kickPlayer', (data) => {
    //Check if there is a lobby, the player kicking is lobby creator and also, the game has not started
    if (lobbySettings[data.lobbyCode] && lobbySettings[data.lobbyCode].creator.id === data.playerId && lobbySettings[data.lobbyCode].lobby.game.startedAt === null) {
      //Check if player exisits still
      let kickedPlayer = lobbySettings[data.lobbyCode].lobby.players.filter((p) => p.id === data.kickedId);
      if (kickedPlayer.length > 0) {
        //Get kicked player socket
        let socketId;
        for (const [id, socketData] of connectedSockets.entries()) {
          if (socketData.playerId === data.kickedId) {
            socketId = id;
            break;
          }
        }

        if (socketId) {
          const playerSocket = io.of('/pvp').sockets.get(socketId);

          //Emit to the kicked players client to remove them from lobby
          io.of('/pvp').to(playerSocket.id).emit('kickPlayer');
          //Disconnect the player from the lobby
          handlePlayerDisc(playerSocket, lobbySettings[data.lobbyCode].lobby, data.kickedId, true);
          return;
        }
      }

    }
  })

  //Leave the lobby
  socket.on('leaveLobby', async (data) => {

    handlePlayerDisc(socket, lobbySettings[data.lobbyCode].lobby || {}, data.playerId, false);

  })

  //Disconnect the player from the lobby
  socket.on('disconnect', () => {


    const { playerId, lobbyCode } = connectedSockets.get(socket.id) || {};

    if (playerId === undefined || lobbyCode === undefined) return;

    if (gameStates[playerId]) {
      if (gameStates[playerId].timer !== null) clearInterval(gameStates[playerId].timer);
      delete gameStates[playerId];
    }

    lobbyDis[lobbyCode] = {
      timer: setTimeout(() => handlePlayerDisc(socket, lobbySettings[lobbyCode].lobby, playerId, false), 5000),
    }

  })



}
