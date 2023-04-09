const mlb = require("../json/mlb.json");
const nfl = require("../json/nfl.json");
const nba = require("../json/nba.json");
const nhl = require("../json/nhl.json");
const sportsWords = require("../json/sportWords.json");
const { scrambleWord, generateRandomNumber } = require('./utilities');

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

const checkSport = async (sport) => {

  const cMlb = await mlb.filter((t) => t.name.toLowerCase().includes(sport));
  const cNfl = await nfl.filter((t) => t.team.toLowerCase().includes(sport));
  const cNba = await nba.filter((t) => t.shortName.toLowerCase().includes(sport));
  const cNhl = await nhl.filter((t) => t.shortName.toLowerCase().includes(sport));
  const cSWords = await sportsWords.filter((t) => t.name.toLowerCase().includes(sport));

  if (cMlb.length > 0 || cNfl.length > 0 || cNba.length > 0 || cNhl.length > 0 || cSWords.length > 0) {
    return true;
  }

  return false;

}


module.exports = {
  getSport,
  checkSport
}