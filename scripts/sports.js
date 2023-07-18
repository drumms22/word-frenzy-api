const mlb = require("../json/mlb.json");
const nfl = require("../json/nfl.json");
const nba = require("../json/nba.json");
const nhl = require("../json/nhl.json");
const sportsWords = require("../json/sportWords.json");
const { scrambleWord, generateRandomNumber } = require('./utilities');
const { checkRitaWord } = require('./words');

const getSport = async () => {

  let r = await generateRandomNumber(0, 7);
  let sportsWord = "";
  let p = r;
  switch (r) {
    case 0:
      r = await generateRandomNumber(0, mlb.length - 1);
      sportsWord = mlb[r].name;
      break;
    case 1:
      r = await generateRandomNumber(0, nfl.length - 1);
      sportsWord = nfl[r].team;
      break;
    case 2:
      r = await generateRandomNumber(0, nba.length - 1);
      sportsWord = nba[r].shortName;
      break;
    case 3:
      r = await generateRandomNumber(0, nhl.length - 1);
      sportsWord = nhl[r].shortName;
      break;
    case 4:
      r = await generateRandomNumber(0, sportsWords.length - 1);
      sportsWord = sportsWords[r].name;
      break;
    case 5:
      r = await generateRandomNumber(0, sportsWords.length - 1);
      sportsWord = sportsWords[r].name;
      break;
    case 6:
      r = await generateRandomNumber(0, sportsWords.length - 1);
      sportsWord = sportsWords[r].name;
      break;
    case 7:
      r = await generateRandomNumber(0, sportsWords.length - 1);
      sportsWord = sportsWords[r].name;
      break;
  }

  let scrambled = await scrambleWord(sportsWord);

  return [scrambled, p];

}

const checkSport = (sport, pos) => {

  let isValid = false;

  let num = 0;

  if (pos > 4) pos = 4;
  switch (pos) {
    case 0:
      const cMlb = mlb.filter((t) => t.name.toLowerCase().includes(sport.toLowerCase()));
      num = cMlb.length;
      break;
    case 1:
      const cNfl = nfl.filter((t) => t.team.toLowerCase().includes(sport.toLowerCase()));
      num = cNfl.length;
      break;
    case 2:
      const cNba = nba.filter((t) => t.shortName.toLowerCase().includes(sport.toLowerCase()));
      num = cNba.length;
      break;
    case 3:
      const cNhl = nhl.filter((t) => t.shortName.toLowerCase().includes(sport.toLowerCase()));
      num = cNhl.length;
      break;
    case 4:
      const cSWords = sportsWords.filter((t) => t.name.toLowerCase().includes(sport.toLowerCase()));
      num = cSWords.length;
      break
  }
  let cw = checkRitaWord(sport);
  if (num > 0 || cw) {
    isValid = true;
  }

  return isValid;

}


module.exports = {
  getSport,
  checkSport
}