const cities = require('../json/updatedCites.json');
const states = require('../json/states.json');
const { unScrambleWord, scrambleWord, letters, generateRandomNumber } = require('./utilities');
const { checkRitaWord } = require('./words');
const getCity = async (min, max) => {

  let tempArr = await cities.filter((c) => c.city.length >= min && c.city.length <= max);
  let r = await generateRandomNumber(0, tempArr.length - 1);
  let cityData = tempArr[r];
  let scrambled = await scrambleWord(cityData.city)

  return [scrambled, cityData.state];
}

const checkCity = (city) => {
  let isValid = false;

  let check = cities.filter((c) => c.city.toLowerCase().includes(city.toLowerCase()));
  let cw = checkRitaWord(city);
  if (check.length > 0 || cw) {
    isValid = true;
  }
}


module.exports = {
  getCity,
  checkCity
}