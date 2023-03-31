const axios = require('axios');
require('dotenv').config()
const getHint = async (word, type) => {

  switch (type) {
    case "definition":
      return await getDefinition(word);
    case "synonym":
      return await getSynonym(word);
  }

}


const getDefinition = async (word) => {

  try {
    let req = await axios.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + word, {
      method: 'GET', // or 'PUT' // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (req.hasOwnProperty("resolution")) {
      throw new Error("No definition found");
    }

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
    return ["No definition found!"];
  }

}

const getSynonym = async (word) => {

  try {
    let req = await axios.get('https://api.api-ninjas.com/v1/thesaurus?word=' + word, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.T_API_KEY
      }
    })

    let synonyms = req.data.synonyms;

    synonyms.map((s, i) => {
      if (s.includes(word)) {
        synonyms.splice(i, 1);
      }
    });

    return synonyms;

  } catch (error) {
    console.log("synonym error: " + error);
    return ["No synonyms found!"];
  }

}



module.exports = {
  getHint
}