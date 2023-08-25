const Lobby = require('../models/Lobby');
const LobbyHint = require('../models/LobbyHint');
const { nanoid } = require('nanoid');
const { getRitaWord, getNewWord, calcWordPoints, calcTime } = require('../scripts/words');
const { getAnimal } = require('../scripts/animals');
const { getCar } = require('../scripts/cars');
const { getCity } = require('../scripts/cities');
const { getSport } = require('../scripts/sports');
const { getMovie } = require('../scripts/movies');
const { scrambleWord, unScrambleWord } = require('../scripts/utilities');
const { words, animals, cars, cities, movies, sports } = require("./hints");
const mongoose = require('mongoose');

const createLobby = async (playerId, name, type, dynamicFields) => {
  try {

    const lobbyCode = nanoid();
    const lobbyFields = {
      code: lobbyCode,
      type: "sp",
      players: [{
        id: playerId,
        username: name,
        isWinner: false,
        timeSpent: 0,
        didComplete: false,
        wordsGuessed: [],
        isCreator: true,
        pointsAquired: 0
      }],
      game: {
        words: [],
        startedAt: null,
        endedAt: null,
        isComplete: false,
        mode: "",
        maxDuration: 0,
        maxPlayers: 2,
        difficulty: 1,
        category: "words",
        modeName: "Player",
        modeDescription: "Player Generated"
      },
      created: Date.now(),
      ...dynamicFields
    };
    const tempLobby = new Lobby(lobbyFields);
    const lobby = await tempLobby.save();
    return lobby;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const createNewLobby = async (players) => {

  try {
    for (let i = 0; i < players.length; i++) {
      players[i].isWinner = false;
      players[i].duration = 0;
      players[i].didComplete = false;
      players[i].wordsGuessed = [];
    }
    const lobbyCode = await nanoid();
    const newLobby = await new Lobby({
      code: lobbyCode,
      players: players,
      game: {
        words: [],
        startedAt: null,
        endedAt: null,
        isComplete: false,
        type: "",
        totalDuration: 0,
        maxPlayers: 2,
        difficulty: 1,
        points: 0,
      },
      created: Date.now(),
    });

    let lobby = await newLobby.save()

    return lobby;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const createTempLobby = async (playerId, username, dynamicFields) => {
  try {

    const lobbyCode = await generateUniqueLobbyCode();

    const lobby = {
      code: lobbyCode,
      type: "pvp",
      players: [{
        id: playerId,
        username,
        isWinner: false,
        timeSpent: 0,
        didComplete: false,
        wordsGuessed: [],
        isCreator: true,
        pointsAquired: 0
      }],
      game: {
        words: [],
        startedAt: null,
        endedAt: null,
        isComplete: false,
        mode: "",
        maxDuration: 0,
        maxPlayers: 2,
        difficulty: 1,
        category: "words",
        modeName: "Player",
        modeDescription: "Player Generated"
      },
      created: Date.now(),
      ...dynamicFields
    };

    return lobby;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const saveLobby = async (lobbyFields) => {
  try {
    const newLobby = await new Lobby(lobbyFields);
    const lobby = await newLobby.save();
    return lobby;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const generateUniqueLobbyCode = async () => {
  let code = nanoid();
  let lobby = await Lobby.findOne({ code });

  while (lobby) {
    code = nanoid();
    lobby = await Lobby.findOne({ code });
  }

  return code;
};

const getLobby = async (lobbyCode) => {

  try {
    const lobby = await Lobby.findOne({ code: lobbyCode });

    if (!lobby) {
      return false;
    } else {
      return lobby;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

const getPlayedTogether = async (player1Id, player2Id) => {
  try {
    const lobbies = await Lobby.find({
      'players.id': player1Id,
      'game.isComplete': true
    });

    const gamesPlayed = lobbies.filter(lobby => {
      return lobby.players.some(p => p.id.toString() === player2Id);
    });

    return gamesPlayed;
  } catch (error) {
    console.log("Games played error:", error);
    return [];
  }
}

const checkLobby = async (lobbyCode, playerId) => {

  try {
    const lobby = await Lobby.findOne({
      code: lobbyCode,
      players: { $elemMatch: { id: playerId } }
    });

    if (!lobby || lobby.game.isComplete) {
      return false;
    } else {
      return lobby;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

const getWords = async (num) => {

  let words = [];
  let time = 0;

  for (let i = 0; i < num; i++) {
    let w = await getRitaWord((4 + i), (4 + i));
    time += w.length * 20;

    words.push(scrambleWord(w));
  }

  return { words, time };

}

const joinLobby = async (lobbyId, playerId, username) => {

  let lobby = await getLobby(lobbyId);

  if (lobby) {
    lobby.players.push({
      _id: new mongoose.Types.ObjectId(),
      id: playerId,
      username: username,
      isWinner: false,
      duration: 0,
      didComplete: false,
      wordsGuessed: [],
      isCreator: false
    })
    let updated = await updateLobby(lobby);
    if (updated) {
      return updated;
    }
  }

  return false;
}

const updateLobby = async (data) => {

  try {
    const result = await Lobby.updateOne(
      { code: data.code },
      { $set: { ...data } }
    );
    let newLobby = await getLobby(data.code);
    // console.log(result);
    return newLobby;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const updatePlayer = async (lobbyCode, player) => {

  try {

    let updated = await Lobby.findOneAndUpdate(
      { code: lobbyCode, 'players.id': player.id },
      { $set: { 'players.$': player } },
      { new: true }
    )

    let newLobby = await getLobby(lobbyCode);
    // console.log(result);
    return newLobby;

  } catch (error) {
    console.log(error);
    return false;
  }

}

const updateGame = async (data) => {

  try {

    const result = await Lobby.updateOne(
      { code: data.code },
      {
        $set: {
          'game.isComplete': data.isComplete,
          'game.endedAt': data.endedAt,
          'game.totalDuration': data.totalDuration,
          'game.points': data.points,
        }
      }
    );


    let newLobby = await getLobby(data.code);
    // console.log(result);
    return newLobby;

  } catch (error) {
    console.log(error);
    return false;
  }

}

const updateEntireLobby = async (lobby) => {

  try {

    const result = await Lobby.updateOne(
      { code: lobby.code },
      {
        $set: { ...lobby }
      }
    );


    let newLobby = await getLobby(lobby.code);
    // console.log(result);
    return newLobby;

  } catch (error) {
    console.log(error);
    return false;
  }

}

const removePlayer = async (data) => {

  try {

    let result = await Lobby.findOneAndUpdate(
      { code: data.lobbyCode },
      { $pull: { players: { id: data.playerId } } },
      { new: true }
    );
    // console.log(result);

    if (result) {
      console.log("player removed");
    } else {
      console.log("player not removed");
    }
    // console.log(result);


  } catch (error) {
    console.log(error);
    return false;
  }

}
const calcLobby = (diff, details) => {

  let obj = details;

  obj.time = obj.secPerWord * obj.words;

  switch (diff) {
    case 0:
      obj.time += 30;
      break;
    case 1:
      obj.points += 10;
      break;
    case 2:
      obj.points += 20;
      obj.time -= 30;
      break;
    case 3:
      obj.points += 30;
      obj.time -= 60;
      break;
  }

  if (obj.time < 1) obj.time = 1;

  return obj;

}

const handleWords = async (catSel, wordCount, mode, speed, diff) => {

  let newWords = []
  let word = "";

  for (let i = 0; i < wordCount; i++) {
    let len = handleLength(catSel, i, mode);
    switch (catSel) {
      case "wordsItem":
      case "wordsLobbyItem":
        word = await getNewWord(len.min, len.max);
        newWords.push({ word: unScrambleWord(word[0]), extr: "", time: 0, points: 0 });
        break;
      case "animalsItem":
      case "animalsLobbyItem":
        word = await getAnimal("", len.min, len.max);
        newWords.push({ word: unScrambleWord(word[0]), extr: "", time: 0, points: 0 });
        break;
      case "carsItem":
      case "carsLobbyItem":
        word = await getCar(len.min, len.max);
        newWords.push({ word: unScrambleWord(word[0]), extr: "", time: 0, points: 0 });
        break;
      case "citiesItem":
      case "citiesLobbyItem":
        word = await getCity(len.min, len.max);
        newWords.push({ word: unScrambleWord(word[0]), extr: word[1], time: 0, points: 0 });
        break;
      case "sportsItem":
      case "sportsLobbyItem":
        word = await getSport(len.min, len.max);
        newWords.push({ word: unScrambleWord(word[0]), extr: word[1], time: 0, points: 0 });
        break;
      case "moviesItem":
      case "moviesLobbyItem":
        word = await getMovie(len.min, len.max);
        newWords.push({ word: unScrambleWord(word[0]), extr: "", time: 0, points: 0 });
        break;
    }

    let time = calcTime([newWords[i].word], diff, speed);
    let points = calcWordPoints(newWords[i].word);
    newWords[i].time = time;
    newWords[i].points = points.totalScore;
  }

  // await handleHints(catSel, newWords, lobbyCode);

  return newWords;

}

const handleLength = (catSel, placement, mode) => {
  let min = 4;
  let max = 4;

  switch (catSel) {
    case "wordsItem":
    case "wordsLobbyItem":

      switch (mode) {
        case "Roulette":
          min = 4;
          max = 4;
          break;
        case "Frenzy":
          min = placement < 5 ? (placement + 4) : 9;
          max = placement < 5 ? (placement + 4) : 9;
          break;
        case "Unscramble":
          min = 3;
          max = 7;
          break;
      }
      break;
    case "animalsItem":
    case "animalsLobbyItem":
      min = placement === 1 ? 6 : placement === 2 ? 9 : 3;
      max = placement === 1 ? 16 : placement === 2 ? 25 : 10;
      break;
    case "carsItem":
    case "carsLobbyItem":
      min = placement === 1 ? 4 : placement === 2 ? 5 : 3;
      max = placement === 1 ? 10 : placement === 2 ? 10 : 10;
      break;
    case "citiesItem":
    case "citiesLobbyItem":
      min = placement === 1 ? 5 : placement === 2 ? 8 : 3;
      max = placement === 1 ? 12 : placement === 2 ? 25 : 8;
      break;
    case "sportsItem":
    case "sportsLobbyItem":
      min = placement === 1 ? 5 : placement === 2 ? 11 : 3;
      max = placement === 1 ? 12 : placement === 2 ? 25 : 6;
      break;
    case "moviesItem":
    case "moviesLobbyItem":
      min = placement === 1 ? 7 : placement === 2 ? 8 : 3;
      max = placement === 1 ? 11 : placement === 2 ? 25 : 7;
      break;
  }



  return { min, max }
}

const getLengthForMode = (mode) => {

}

const handleHints = async (catSel, selWords, lobbyCode) => {

  for (let i = 0; i < selWords.length; i++) {
    let word = selWords[i].word;
    let regex = /Item/;
    let sel = catSel.replace(regex, "");
    let hint1 = "";
    let hint2 = "";

    let type = sel === "words" ? "definition" : "normal";

    let h1Res = await callGetHint(sel, word, [], type, sel === "sports" || sel === "cities" ? selWords[i].extr : null);

    hint1 = h1Res[0].hint;

    type = sel === "words" ? "synonym" : "normal";

    let h2Res = await callGetHint(sel, word, h1Res[0].hintsUsed, type, sel === "sports" || sel === "cities" ? selWords[i].extr : null);

    hint2 = h2Res[0].hint;

    await saveLobbyHint(lobbyCode, word, hint1, hint2);

  }

}

const callGetHint = async (name, word, prevHints, type, extra) => {

  const objects = { words, animals, cars, cities, movies, sports };

  const obj = objects[name];
  if (obj && typeof obj.getHint === 'function') {
    return await obj.getHint(word, type, prevHints, extra);
  } else {
    throw new Error(`Object ${name} does not have a getHint method`);
  }
}

const saveLobbyHint = async (code, w, h1, h2) => {


  try {

    const newHint = await new LobbyHint({
      lobbyCode: code,
      word: w,
      hint1: h1,
      hint2: h2
    });

    let save = await newHint.save();

    if (save) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    return false;
  }


}

const getLobbyHint = async (code, w) => {

  try {
    let h = await LobbyHint.findOne({ lobbyCode: code, word: w });

    return h;

  } catch (error) {
    console.log("getLobbyHintErr: " + error);
    return false;
  }
}

const deleteUnused = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // set to midnight
  const result = await Lobby.deleteMany({
    'game.startedAt': null,
    created: { $lt: today }
  });

  console.log(`Deleted ${result.deletedCount} lobbies.`);

}

const deleteAllLobbies = async () => {
  try {
    const { deletedCount } = await Lobby.deleteMany({});
    console.log(`Deleted ${deletedCount} lobbies.`);
  } catch (err) {
    console.error('Error deleting lobbies:', err);
  }
};


// Update all documents in the collection with difficulty property
// const result = await Lobby.updateMany({}, { $set: { "game.modeName": "Player" } });
// console.log(result.nModified + ' lobbies updated');

module.exports = {
  createLobby,
  joinLobby,
  checkLobby,
  updateLobby,
  handleWords,
  calcLobby,
  updatePlayer,
  updateGame,
  removePlayer,
  getLobby,
  createNewLobby,
  getLobbyHint,
  deleteUnused,
  deleteAllLobbies,
  callGetHint,
  createTempLobby,
  saveLobby,
  handleHints,
  updateEntireLobby,
  getPlayedTogether
}