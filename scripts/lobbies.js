const Lobby = require('../models/Lobby');
const LobbyHint = require('../models/LobbyHint');
const { nanoid } = require('nanoid');
const { getRitaWord, getNewWord } = require('../scripts/words');
const { getAnimal } = require('../scripts/animals');
const { getCar } = require('../scripts/cars');
const { getCity } = require('../scripts/cities');
const { getSport } = require('../scripts/sports');
const { getMovie } = require('../scripts/movies');
const { scrambleWord, unScrambleWord } = require('../scripts/utilities');
const { words, animals, cars, cities, movies, sports } = require("./hints");
const mongoose = require('mongoose');

const createLobby = async (playerId, name) => {

  try {
    const lobbyCode = await nanoid();
    const newLobby = await new Lobby({
      code: lobbyCode,
      players: [{
        id: playerId,
        username: name,
        isWinner: false,
        duration: 0,
        didComplete: false,
        wordsGuessed: [],
        isCreator: true
      }],
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
const calcLobby = (data) => {

  let extr = 0;
  let time = 180;

  let obj = {
    time: 180,
    words: 3,
    points: 0
  }

  switch (data.diff) {
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

  return obj;

}

const handleWords = async (catSel, lobbyCode) => {

  let newWords = []
  let word = "";
  for (let i = 0; i < 3; i++) {
    let len = await handleLength(catSel, i);
    switch (catSel) {
      case "wordsLobbyItem":
        word = await getNewWord(len.min, len.max);
        newWords.push({ word, extr: "" });
        break;
      case "animalsLobbyItem":
        word = await getAnimal("", len.min, len.max);
        newWords.push({ word: word[0], extr: "" });
        break;
      case "carsLobbyItem":
        word = await getCar(len.min, len.max);
        newWords.push({ word: word[0], extr: "" });
        break;
      case "citiesLobbyItem":
        word = await getCity(len.min, len.max);
        newWords.push({ word: word[0], extr: word[1] });
        break;
      case "sportsLobbyItem":
        word = await getSport(len.min, len.max);
        newWords.push({ word: word[0], extr: word[1] });
        break;
      case "moviesLobbyItem":
        word = await getMovie(len.min, len.max);
        newWords.push({ word: word[0], extr: "" });
        break;
    }

  }

  await handleHints(catSel, newWords, lobbyCode);

  return newWords;

}

const handleHints = async (catSel, selWords, lobbyCode) => {

  for (let i = 0; i < selWords.length; i++) {
    let word = await unScrambleWord(selWords[i].word);
    let regex = /LobbyItem/;
    let sel = catSel.replace(regex, "");
    let hint1 = "";
    let hint2 = "";
    const objects = { words, animals, cars, cities, movies, sports };

    let type = sel === "words" ? "definition" : "normal";

    let h1Res = await callGetHint(sel, word, [], objects, type, sel === "sports" || sel === "cities" ? selWords[i].extr : null);

    hint1 = h1Res[0].hint;

    type = sel === "words" ? "synonym" : "normal";

    let h2Res = await callGetHint(sel, word, h1Res[0].hintsUsed, objects, type, sel === "sports" || sel === "cities" ? selWords[i].extr : null);

    hint2 = h2Res[0].hint;

    await saveLobbyHint(lobbyCode, word, hint1, hint2);

  }

}

const callGetHint = async (name, word, prevHints, objects, type, extra) => {
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

const handleLength = (catSel, placement) => {
  let min = 4;
  let max = 4;

  switch (catSel) {
    case "wordsLobbyItem":
      min = placement === 1 ? 5 : placement === 2 ? 6 : 4;
      max = placement === 1 ? 5 : placement === 2 ? 6 : 4;
      break;
    case "animalsLobbyItem":
      min = placement === 1 ? 6 : placement === 2 ? 9 : 3;
      max = placement === 1 ? 16 : placement === 2 ? 25 : 10;
      break;
    case "carsLobbyItem":
      min = placement === 1 ? 4 : placement === 2 ? 5 : 3;
      max = placement === 1 ? 10 : placement === 2 ? 10 : 10;
      break;
    case "citiesLobbyItem":
      min = placement === 1 ? 5 : placement === 2 ? 8 : 3;
      max = placement === 1 ? 12 : placement === 2 ? 25 : 8;
      break;
    case "sportsLobbyItem":
      min = placement === 1 ? 5 : placement === 2 ? 11 : 3;
      max = placement === 1 ? 12 : placement === 2 ? 25 : 6;
      break;
    case "moviesLobbyItem":
      min = placement === 1 ? 7 : placement === 2 ? 8 : 3;
      max = placement === 1 ? 11 : placement === 2 ? 25 : 7;
      break;
  }

  return { min, max }
}

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
  getLobbyHint
}