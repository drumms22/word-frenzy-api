const express = require('express')
const router = express.Router();
const { animals1 } = require("../json/animals.json");
const { getAnimal } = require('../scripts/animals');
const { checkRitaWord } = require('../scripts/words');

router.get('/', async (req, res) => {

  let animals = await getAnimal("animals", req.query.min, req.query.max);

  res.json({
    data: animals
  })
})

router.post('/check', async (req, res) => {

  let words = req.body.name.split(" ");

  let animals = [];

  for (let i = 0; i < words.length; i++) {
    let d = animals1.filter((a) => a.toLowerCase().includes(words[i]))
    let cw = checkRitaWord(words[i])
    if (d.length > 0 || cw) {
      animals.push(words[i]);
    }
  }


  let isValid = false;
  let numNeeded = Math.ceil(words.length * .5);

  if (animals.length > 0 && animals.length >= numNeeded) {
    isValid = true;
  }

  res.json({
    data: [isValid]
  })
})

module.exports = router;