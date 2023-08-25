require('dotenv').config()
const axios = require('axios');
const fish = require('../json/fish.json');
const animals = require('../json/animals.json');
const { createHint } = require('./hints/animals');
const { unScrambleWord, scrambleWord, letters, generateRandomNumber } = require('./utilities');
const { checkRitaWord } = require('./words');
const botanicZoo = require("botanic-zoo-api");
//691 animals
const getAnimal = async (type, min, max) => {
  // let filtered = animals.animals1.filter((a) => a.length >= min && a.length <= max);
  // let r = await generateRandomNumber(0, filtered.length - 1);

  let animalName = "";

  let r = 0;
  let filtered = [];
  switch (type) {
    case "animals":
      filtered = animals.animals3.filter((a) => a.length >= min && a.length <= max);
      r = await generateRandomNumber(0, filtered.length - 1);
      animalName = filtered[r];
      break;
    case "fish":

      break;
    default:
      filtered = animals.animals3.filter((a) => a.length >= min && a.length <= max);
      r = await generateRandomNumber(0, filtered.length - 1);
      animalName = filtered[r];
  }


  let res = await fetchAnimalData(animalName, min, max);

  if (typeof res != undefined && res.length > 0) {
    r = await generateRandomNumber(0, res.length - 1);
    animalName = res[r].name;
  }

  if (typeof animalName === undefined || res.length === 0) {
    filtered = animals.animals3.filter((a) => a.length > 5 && a.length <= max);
    r = await generateRandomNumber(0, filtered.length - 1);
    animalName = filtered[r];
  }

  let scrambled = await scrambleWord(animalName.toLowerCase());

  //let hint = await createHint(res[r]);


  return [scrambled, animalName];

}


const fetchAnimalData = async (name, min, max) => {
  try {

    let req = await axios.get(`https://api.api-ninjas.com/v1/animals?name=${name}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.T_API_KEY
      }
    })
    // console.log(req.data);
    if (req.data.length === 0) {
      return [];
    }


    let nameLenFiltered = await filteredWordCount(req.data);

    let finalList = await checkIndWordLen(nameLenFiltered);


    let a = await finalList.filter((x) => x.name.match(/[a-zA-Z ]+/g).length === 1 && x.name.length >= min && x.name.length <= max);
    return a;
  } catch (error) {
    console.log("animals error: " + error);
    return [];
  }
}

const filteredWordCount = (arr) => arr.filter((item) => item.name.split(" ").length < 4 && item.name.length < 30);


const checkIndWordLen = (arr) => {

  let filtered = [];

  arr.map((item) => {
    let split = item.name.split(" ");
    let check = split.filter((x) => x.length < 11);
    if (split.length === check.length) {
      filtered.push(item);
    }
  })
  return filtered;
}

const checkAnimal = (words) => {

  let animalsMatch = [];

  for (let i = 0; i < words.length; i++) {
    let d = animals.animals1.filter((a) => a.toLowerCase().includes(words[i]))
    let cw = checkRitaWord(words[i])
    if (d.length > 0 || cw) {
      animalsMatch.push(words[i]);
    }
  }

  let isValid = false;
  let numNeeded = Math.ceil(words.length * .5);

  if (animalsMatch.length > 0 && animalsMatch.length >= numNeeded) {
    isValid = true;
  }

  return isValid;

}

module.exports = {
  getAnimal,
  checkAnimal
}

