const express = require('express')
const router = express.Router()
const { getNewWord, unScrambleWord } = require('../scripts/words');
const { getHint } = require('../scripts/hints');

router.all('/hint', (req, res, next) => {
  //p = position number for unscrambling
  if (!req.query.hasOwnProperty("p") || req.query.p.length < 4) {
    return res.json({
      error: {
        message: "Incorrect word!"
      }
    });
  }

  let pos = req.query.p[3];

  const word = unScrambleWord(req.query.word, pos);

  if (word === "incorrect") {
    return res.json({
      error: {
        message: "Incorrect word!"
      }
    });
  }

  req.query.word = word;

  next();
})

// define the home page route
router.get('/word', (req, res) => {
  if (!req.query.hasOwnProperty("min")) req.query.min = 4;
  if (!req.query.hasOwnProperty("max")) req.query.max = 4;
  const newWord = getNewWord(req.query.min, req.query.max);

  res.json({
    data: [
      newWord
    ]
  })
})
// define the about route
router.get('/hint', async (req, res) => {
  if (!req.query.hasOwnProperty("word")) {
    return res.json({
      error: {
        message: "No word provided!"
      }
    })
  }

  if (!req.query.hasOwnProperty("type")) req.query.type = "definition";
  const hint = await getHint(req.query.word, req.query.type)

  res.json({
    data: hint
  })
})

module.exports = router;