require('dotenv').config();
const cars = require('../json/cars.json')

const { generateRandomNumber, scrambleWord } = require('./utilities');
const getCar = async (min, max) => {
  let filtered = cars.filter((a) => a.model.length >= min && a.model.length <= max);
  let r = await generateRandomNumber(0, filtered.length - 1);
  let scrambled = await scrambleWord(cars[r].model);
  return [scrambled];
}


module.exports = {
  getCar
}