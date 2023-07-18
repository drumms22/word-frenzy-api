const express = require('express')
const router = express.Router()
const { getNewWord, checkWord } = require('../scripts/words');
const { scrambleWord, unScrambleWord } = require('../scripts/utilities');
const { getPlayedTogether } = require('../scripts/lobbies');

const authMiddleWare = (req, res, next) => {
  //validate

  next();
}
// define the home page route
router.get('/', async (req, res) => {
  if (!req.query.hasOwnProperty("min")) req.query.min = 4;
  if (!req.query.hasOwnProperty("max")) req.query.max = 4;


  // let pt = await getPlayedTogether("6430f475530103d3127f0d16", "6448aa01d6f35771f9756c31");

  const newWord = await getNewWord(req.query.min, req.query.max, req.query.limit);
  res.json({
    data: newWord
  })
})


router.post('/check', authMiddleWare, async (req, res) => {

  let word = req.body.name;

  let check = await checkWord(word);

  res.json({
    data: [check]
  })
})

module.exports = router;