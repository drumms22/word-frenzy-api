require('dotenv').config()
const axios = require('axios');
const { generateHint, calculateNumHints, createHint, createSpecialHint, scrambleWord } = require('../utilities');
const cities = require("../../json/updatedCites.json");

const getHint = async (city, type, previousHints, state) => {
  let hint = "";
  let hintsUsed = previousHints;
  let cityS = city.toLowerCase().split(' ');

  if (cityS[0] === "st") {

    city = cityS[0] + ". " + cityS[1];
  }

  let res = await fetchCityData(city);

  const availableFields = Object.entries(res[0])
    .filter(([key, value]) => value !== null && value !== undefined)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  if (previousHints.length >= 3 && type !== "reveal") {
    return [{
      hint: "",
      hintsUsed,
      completed: true
    }];
  }

  if (type === "reveal") {
    let numHints = await calculateNumHints(city);
    let p = createSpecialHint(city, numHints);
    hint = p;
  } else {
    let hint1 = null;
    if (hintsUsed.length === 0) {
      hintsUsed.push("state")
      hint += "The city is located in " + state;
    } else {
      hint1 = await createHint(getFields(availableFields), hintsUsed);
      hintsUsed.push(hint1.name)
      if (hint1.name === "is capital") {
        hint += "The city is " + hint1.value;
      } else {
        hint += await generateHint(hint1.name, hint1.value, "The city");
      }

    }

    let hint2 = await createHint(getFields(availableFields), hintsUsed);

    if (hint2) {
      hintsUsed.push(hint2.name)
      let hint2Mess = "";
      if (hint2.name === "is capital") {
        hint2Mess += "The city is " + hint2.value;
      } else {
        hint2Mess += await generateHint(hint2.name, hint2.value, "The city");
      }
      if (hint2Mess != "" && hint != "") {
        hint += " and " + hint2Mess.toLowerCase();
      } else {
        hint += hint2Mess;
      }
    }

  }

  if (hint === "") {
    let numHints = await calculateNumHints(animal);
    hint = createSpecialHint(animal, numHints);
  }

  return [{
    hint,
    hintsUsed,
    completed: false
  }];
}

const fetchCityData = async (name) => {
  try {

    let req = await axios.get(`https://api.api-ninjas.com/v1/city?name=${name}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.T_API_KEY
      }
    })
    // console.log(req.data);
    if (req.data.length === 0) {
      return [];
    }

    return req.data;
  } catch (error) {
    console.log("animals error: " + error);
    return [];
  }
}

const getFields = (city) => {

  const fields = [];
  if (city.population) {
    fields.push({ name: 'population', value: city.population });
  }
  if (city.is_capital !== undefined) {
    fields.push({ name: 'is capital', value: city.is_capital ? "the capital" : "not the capital" });
  }
  return fields;
};
module.exports = {
  getHint
}