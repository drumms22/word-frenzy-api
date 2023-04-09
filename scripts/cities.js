const cities = require('../json/updatedCites.json');
const states = require('../json/states.json');
const { unScrambleWord, scrambleWord, letters, generateRandomNumber } = require('./utilities');

const getCity = async (min, max) => {

  let tempArr = await cities.filter((c) => c.city.length >= min && c.city.length <= max);
  let r = await generateRandomNumber(0, tempArr.length - 1);
  let cityData = tempArr[r];
  let scrambled = await scrambleWord(cityData.city)

  return [scrambled, cityData.state];
}


module.exports = {
  getCity
}