const movies = require("../movies.json");
const { scrambleWord, generateRandomNumber } = require('./utilities');
const { checkRitaWord } = require('./words');

const getMovie = async (min, max) => {

  let filtered = await movies.filter((m) => m.hasOwnProperty("title") && m.title.length >= min && m.title.length <= max);

  let r = await generateRandomNumber(0, filtered.length - 1);

  let movie = filtered[r].title;
  let scrambled = await scrambleWord(movie)
  return [scrambled]
}

const checkMovie = (name) => {
  let isValid = false;

  let check = movies.filter((c) => c.title.toLowerCase().includes(name.toLowerCase()));
  const isTitleInSimilar = movies.some(movie => {
    return movie.similar && Array.isArray(movie.similar) && movie.similar.some(similarMovie => similarMovie.title.toLowerCase() === name.toLowerCase());
  });
  let cw = checkRitaWord(name);
  if (check.length > 0 || isTitleInSimilar || cw) {
    isValid = true;
  }

  return isValid;
}


module.exports = {
  getMovie,
  checkMovie
}