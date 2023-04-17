const express = require('express')
const router = express.Router();
const { unScrambleWord } = require("../scripts/utilities");
const { words, animals, cars, cities, sports, movies } = require('../scripts/hints');


// define the about route
router.post('/', async (req, res) => {
  const hintTypes = ["word", "animal", "car", "city", "sport", "movie"];
  const data = req.body;
  console.log("hint body: ", data);
  try {
    let prop = "";
    for (let i = 0; i < hintTypes.length; i++) {
      if (hintTypes[i] in data) {
        prop = hintTypes[i];
      }
    }
    let hint = "";
    const word = unScrambleWord(data[prop]);

    if (!word) throw new Error("Not a valid entry!");

    switch (prop) {
      case "word":
        hint = await words.getHint(word, data.type, data.hintsUsed);
        break;
      case "animal":
        hint = await animals.getHint(word, data.type, data.hintsUsed);
        break;
      case "car":
        hint = await cars.getHint(word, data.type, data.hintsUsed);
        break;
      case "city":
        hint = await cities.getHint(word, data.type, data.hintsUsed, data.state);
        break;
      case "sport":
        hint = await sports.getHint(word, data.type, data.hintsUsed, data.sportC);
        break;
      case "movie":
        hint = await movies.getHint(word, data.type, data.hintsUsed);
        break;
      default:
        throw new Error("Hint cannot be obtained!")
    }
    console.log("hint hint: ", hint);
    return res.json({
      data: hint
    });

  } catch (error) {
    console.log("hint error: " + error.Error);
    return res.json({
      error: {
        message: error.Error
      }
    })
  }

});



module.exports = router;