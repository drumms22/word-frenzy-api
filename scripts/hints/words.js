const axios = require('axios');
require('dotenv').config()
const { createSpecialHint, calculateNumHints } = require('../utilities');
const getHint = async (word, type, hintsUsed) => {
  console.log(type);
  let hint = "";
  let completed = false;
  switch (type) {
    case "definition":
      hintsUsed.push("definition")
      let def = await getDefinition(word);
      if (def.length > 0 && typeof def != undefined) {
        hint = def;
      } else {
        hint = await getSynonym(word);
      }
      break;
    case "synonym":
      hintsUsed.push("synonym")
      hint = await getSynonym(word);

      break;
    case "reveal":
      let numHints = await calculateNumHints(word);
      hint = createSpecialHint(word, numHints);
      completed = true;
      break;
  }

  if (hint === "") {
    let numHints = await calculateNumHints(word);
    hint = createSpecialHint(word, numHints);
  }
  console.log(hint);
  return [{
    hint,
    hintsUsed,
    completed
  }];
}


const getDefinition = async (word) => {

  try {
    let req = await axios.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + word, {
      method: 'GET', // or 'PUT' // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (req.hasOwnProperty("resolution")) throw new Error("No definition found");


    let def = req.data[0].meanings[0].definitions[0].definition;

    let split = def.split(" ");

    split.map((s, i) => {
      if (s.includes(word)) {
        split[i] = "______"
      }
    });

    let joined = split.join(" ");

    return [joined]
  } catch (error) {
    console.log("definition error: " + error);
    return [];
  }

}

const getSynonym = async (word) => {
  //city?country=us&min_population=10000&max_population=450000&limit=10
  try {
    let req = await axios.get(`https://api.api-ninjas.com/v1/thesaurus?word=${word}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.T_API_KEY
      }
    })

    console.log(req.data);
    let synonyms = req.data.synonyms;

    synonyms.map((s, i) => {
      if (s.includes(word)) {
        synonyms.splice(i, 1);
      }
    });

    return [synonyms.join(', ')];

  } catch (error) {
    console.log("synonym error: " + error);
    return ["No synonyms found!"];
  }

}



module.exports = {
  getHint,
  getDefinition
}