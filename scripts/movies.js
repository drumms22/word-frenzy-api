const movies = require("../movies.json");
const { scrambleWord, generateRandomNumber } = require('./utilities');

const getMovie = async (min, max) => {

  let filtered = await movies.filter((m) => m.hasOwnProperty("title") && m.title.length >= min && m.title.length <= max);

  let r = await generateRandomNumber(0, filtered.length - 1);

  let movie = filtered[r].title;
  let scrambled = await scrambleWord(movie)
  return [scrambled]
}


module.exports = {
  getMovie
}