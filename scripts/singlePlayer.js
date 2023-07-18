const { getUser, generateUsername, saveUser } = require('./users');
const { getRitaWord, getNewWord } = require('../scripts/words');
const { getAnimal } = require('../scripts/animals');
const { getCar } = require('../scripts/cars');
const { getCity } = require('../scripts/cities');
const { getSport } = require('../scripts/sports');
const { getMovie } = require('../scripts/movies');

const getPlayer = async (playerId) => {
  let player = await getUser(playerId);

  if (player) {

    let np = player;

    np.data = JSON.parse(player.data);

    return np;
  }
}

const createPlayer = async (data) => {

  let username = await generateUsername();

  let save = await saveUser(JSON.parse(data), username);

  if (save) {
    let player = await getUser(save);
    return player;
  }

  return false;
}

module.exports = {
  getPlayer,
  createPlayer
}