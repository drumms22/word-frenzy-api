require('dotenv').config();
const cars = require('../json/cars.json')
const { checkRitaWord } = require('./words');

const { generateRandomNumber, scrambleWord } = require('./utilities');
const getCar = async (min, max) => {
  let filtered = cars.filter((a) => a.model.length >= min && a.model.length <= max);
  let r = await generateRandomNumber(0, filtered.length - 1);
  let scrambled = await scrambleWord(cars[r].model);
  return [scrambled];
}


const checkCar = (car) => {

  let isValid = false;

  let check = cars.filter((c) => c.model.includes(car) || c.make.includes(car));
  let cw = checkRitaWord(car)
  if (check.length > 0 || cw) {
    isValid = true;
  }

  return isValid;

}

module.exports = {
  getCar,
  checkCar
}