const express = require('express')
const router = express.Router()
const { getNewWord, checkWord } = require('../scripts/words');
const { scrambleWord, unScrambleWord } = require('../scripts/utilities');

// define the home page route
router.get('/', async (req, res) => {
  if (!req.query.hasOwnProperty("min")) req.query.min = 4;
  if (!req.query.hasOwnProperty("max")) req.query.max = 4;
  const newWord = await getNewWord(req.query.min, req.query.max);
  res.json({
    data: [
      newWord
    ]
  })
})


router.post('/check', async (req, res) => {

  let isValid = false;

  let word = req.body.name;

  let check = await checkWord(word);

  if (check) {
    isValid = true;
  }

  res.json({
    data: [isValid]
  })
})

module.exports = router;