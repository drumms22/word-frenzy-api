const express = require('express')
const router = express.Router();
const { checkGuess } = require('../scripts/guesses');
const cars = require('../json/cars.json');
const { getLobby } = require('../scripts/lobbies');


router.post('/check', async (req, res) => {

  let isValid = false;

  let { lobbyCode, guess, index, word } = req.body;
  let wordToCheck = "";

  if (word) {
    wordToCheck = word;
  } else {

    let lobby = await getLobby(lobbyCode);

    if (!lobby) {
      return res.json({
        data: [isValid]
      })
    }

    wordToCheck = lobby.game.words[index].word;

  }



  let check = await checkGuess(wordToCheck, guess);

  res.json({
    data: [check]
  })
})


module.exports = router;