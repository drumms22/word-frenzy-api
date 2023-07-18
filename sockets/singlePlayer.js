const { getPlayer, createPlayer } = require('../scripts/singlePlayer');
const { unScrambleWord } = require('../scripts/utilities');
const { createLobby, handleWords, updatePlayer, updateGame, callGetHint } = require('../scripts/lobbies');
const { saveReward } = require('../scripts/rewards');
const { checkGuess, validateGuess } = require('../scripts/guesses');
const { updateUser, calcSpeed } = require('../scripts/users');

const lobbyTimers = {};

const lobbies = {};

const calcDiffPoints = (diff) => {
  let points = 0;

  switch (diff) {
    case 1:
      points = 15;
      break;
    case 2:
      points = 25;

      break;
    case 3:
      points = 35;
      break;
  }

  return points;
}

module.exports = (io, socket, connUsers) => {

  const gameOver = () => {
    clearInterval(lobbyTimers[socket.id]);
    let notComplete = lobbies[socket.id].wordData.map((wd) => wd.word).slice(lobbies[socket.id].currentPos);
    socket.emit('gameOver', { notComplete });
    setTimeout(() => endScreenTimer(), 5000);
  }

  const returnHome = () => {
    socket.emit('returnHome');
    delete lobbyTimers[socket.id];
    delete lobbies[socket.id];
  }

  const endScreenTimer = () => {

    let time = 16;

    socket.emit('startEndScreen');

    lobbyTimers[socket.id] = setInterval(() => {

      time--;
      if (time < 1) {
        clearInterval(lobbyTimers[socket.id]);
        returnHome();
        return;
      }

      socket.emit('endScreenTimer', time);
    }, 1000);

  }

  const handleGameOver = async () => {


    if (lobbies[socket.id].time > 0) {
      lobbies[socket.id].userGameData.totalChallengesCompleted++;
      lobbies[socket.id].player.isWinner = true;
      lobbies[socket.id].player.didComplete = true;
    }
    // words,
    // startedAt: Date.now(),
    // endedAt: null,
    // mode: data.mode,
    // maxDuration: time,
    // isComplete: false,
    // maxPlayers: 1,
    // difficulty: data.diff,
    // rewards: [reward._id.toString()],
    // category: data.selCat
    await updateGame({
      isComplete: true,
      endedAt: Date.now(),
      code: lobbies[socket.id].code
    });
    await handlePlayerUpdate();
  }

  const handlePlayerUpdate = async () => {

    lobbies[socket.id].userGameData.totalPoints += lobbies[socket.id].wordData[lobbies[socket.id].currentPos].points;
    lobbies[socket.id].userGameData.totalCharCount += lobbies[socket.id].currentWord.split('').join('').length;
    lobbies[socket.id].userGameData.totalWordsCompleted++;
    lobbies[socket.id].userGameData.totalTimeSpent += lobbies[socket.id].timeAccum;
    lobbies[socket.id].player.wordsGuessed.push(lobbies[socket.id].currentWord);
    lobbies[socket.id].player.pointsAquired += lobbies[socket.id].wordData[lobbies[socket.id].currentPos].points;
    lobbies[socket.id].player.timeSpent = lobbies[socket.id].timeAccum;

    await updatePlayer(lobbies[socket.id].code, lobbies[socket.id].player);
    let gd = JSON.stringify(lobbies[socket.id].userGameData);
    await updateUser({
      id: lobbies[socket.id].player.id,
      data: gd,
    })

    let updated = await calcSpeed(lobbies[socket.id].player.id.toString());

    if (updated) {
      socket.emit('updateStats', updated.gameData)
    }

  }

  const handlePlayerLeave = async () => {
    lobbies[socket.id].userGameData.totalTimeSpent += lobbies[socket.id].timeAccum;
    lobbies[socket.id].player.timeSpent += lobbies[socket.id].timeAccum;
    await updatePlayer(lobbies[socket.id].code, lobbies[socket.id].player);
    let gd = JSON.stringify(lobbies[socket.id].userGameData);
    await updateUser({
      id: lobbies[socket.id].player.id,
      data: gd,
    })

    await calcSpeed(lobbies[socket.id].player.id.toString());

    await updateGame({
      isComplete: true,
      endedAt: Date.now(),
      code: lobbies[socket.id].code
    });

    delete lobbyTimers[socket.id];
    delete lobbies[socket.id];

  }

  const handleGameInit = async (data, wordCount) => {
    let player = await getPlayer(data.player.id);
    let spd = (player.gameData.speedData.totalTime / player.gameData.speedData.totalChar);
    let words = await handleWords(data.selCat, wordCount, data.mode, !spd ? 20 : spd, data.diff);
    console.log(words);
    // let newWords = words.map((w) => w.word);
    let time = await words.reduce((acc, word) => acc + word.time, 0);
    let points = await words.reduce((acc, word) => acc + word.points, 0);

    //let reward = await saveReward("Points", "Reward for completing a challenge", points, "none");

    let spLobby =
    {
      game: {
        words,
        startedAt: Date.now(),
        endedAt: null,
        mode: data.mode,
        maxDuration: time,
        isComplete: false,
        maxPlayers: 1,
        difficulty: data.diff,
        rewards: [""],//reward._id.toString()
        category: data.selCat
      }
    }


    let lobby = await createLobby(player._id.toString(), player.username, "sp", { ...spLobby });

    lobbies[socket.id] = {
      userGameData: player.gameData,
      player: lobby.players[0],
      code: lobby.code,
      wordData: words,
      currentWord: words[0].word,
      time: 20,
      maxDuration: 20,
      timeAccum: 0,
      currentPos: 0,
      endPos: words.length - 1,
      selCat: data.selCat,
      diff: data.diff,
      mode: data.mode,
      hintData: {
        hints: [],
        hintsUsed: [],
        completed: false,
        maxHints: 3,
      }
    }

    socket.emit('startGame');

    // console.log(lobbies[socket.id].currentWord);
  }

  const startTime = () => {
    lobbyTimers[socket.id] = setInterval(() => {

      lobbies[socket.id].time--;
      if (lobbies[socket.id].time <= 0) {
        clearInterval(lobbyTimers[socket.id]);
        socket.emit('updateTime', 0);
        gameOver();
        return;
      }

      socket.emit('updateTime', lobbies[socket.id].time);

    }, 1000);
  }

  const handleNextWord = () => {
    lobbies[socket.id].currentPos++;
    let prevWord = lobbies[socket.id].currentWord;
    lobbies[socket.id].currentWord = lobbies[socket.id].wordData[lobbies[socket.id].currentPos].word;
    lobbies[socket.id].time = lobbies[socket.id].wordData[lobbies[socket.id].currentPos].time;
    lobbies[socket.id].maxDuration = lobbies[socket.id].wordData[lobbies[socket.id].currentPos].time;
    startTime();

    console.log(lobbies[socket.id].currentWord);
    socket.emit('nextWord', { nextWord: lobbies[socket.id].currentWord, prevWord });
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
    console.log("newOOP");
    console.log(newOOP);
    return newOOP;

  }
  const combineArr = (arr1, arr2) => {
    const combined = [...arr1, ...arr2]; // Combine the arrays
    const unique = [...new Set(combined)];
    return unique;
  }

  const handleHints = async (type) => {
    let regex = /Item/;
    let sel = lobbies[socket.id].selCat.replace(regex, "");

    let hint = await callGetHint(sel, lobbies[socket.id].wordData[lobbies[socket.id].currentPos].word, lobbies[socket.id].hintData.hintsUsed, type || "normal", lobbies[socket.id].wordData[lobbies[socket.id].currentPos].extra);

    // let hint = await callGetHint("words", "poke", data.prevHints, data.type, "");

    lobbies[socket.id].hintData.hintsUsed = hint[0].hintsUsed;
    lobbies[socket.id].hintData.hints.push(hint[0].hint);

    if (lobbies[socket.id].hintData.hints.length >= lobbies[socket.id].hintData.maxHints) {
      lobbies[socket.id].hintData.completed = true;
      hint[0].completed = true;
    }

    socket.emit("getHint", hint);


  }

  //SOCKET HANDLERS START HERE -------------------------------------------------------------------------------------------------

  socket.on('getPlayer', async (playerId) => {
    let player = await getPlayer(playerId);
    socket.emit('getPlayer', player);
  })

  socket.on('createPlayer', async (data) => {
    let player = await createPlayer(data);
    socket.emit("getPlayer", player);
  })

  socket.on('startGame', async (data) => {

    handleGameInit(data, data.wordCount);

  });

  socket.on('startTime', () => {

    socket.emit("startTime", lobbies[socket.id])

    startTime();
  })

  socket.on("checkGuess", async (data) => {

    if (data.guess === lobbies[socket.id].currentWord) {
      clearInterval(lobbyTimers[socket.id]);
      if (lobbies[socket.id].currentPos >= lobbies[socket.id].endPos) {
        lobbies[socket.id].timeAccum += lobbies[socket.id].maxDuration - lobbies[socket.id].time;

        socket.emit('completed', { word: lobbies[socket.id].currentWord });
        setTimeout(() => endScreenTimer(), 5000);
        //  handleGameOver();
        return;
      } else {

        lobbies[socket.id].timeAccum += lobbies[socket.id].maxDuration - lobbies[socket.id].time;
        // handlePlayerUpdate()
        handleNextWord();
      }
      // let player = await updateP.players.filter((p) => p.id.toString() === data.player.id);

    } else {

      let validate = await validateGuess(data.guess, lobbies[socket.id].selCat, data.correctLetters, lobbies[socket.id].currentWord);

      if (!validate) {
        socket.emit('invalidGuess');
        return;
      }

      let check = await checkGuess(lobbies[socket.id].currentWord, data.guess);
      let combined = await combineArr(data.outOfPlaceLetters, check.outOfPlaceLetters);
      check.outOfPlaceLetters = await checkOOP(check.correctLetters, lobbies[socket.id].currentWord.split(''), combined);
      socket.emit('checkGuess', check, lobbies[socket.id].currentWord);

    }

  })

  socket.on('continueGame', () => {
    clearInterval(lobbyTimers[socket.id]);
    handleGameInit(lobbies[socket.id], 3);
  })

  socket.on('getHint', (data) => {
    console.log("hintsused1: ", lobbies[socket.id].hintData.hintsUsed)
    if (lobbies[socket.id].hintData.hints.length >= lobbies[socket.id].hintData.hints.maxHints) {

      socket.emit("endHints");
      return;

    }

    handleHints(data.type);
  })

  socket.on('disconnect', () => {
    if (!lobbies[socket.id]) return;
    clearInterval(lobbyTimers[socket.id]);

    lobbies[socket.id].timeAccum = lobbies[socket.id].maxDuration - lobbies[socket.id].time;

    handlePlayerLeave()
  })

}
