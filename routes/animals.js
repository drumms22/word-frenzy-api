const express = require('express')
const router = express.Router();
const { getAnimal, checkAnimal } = require('../scripts/animals');

router.get('/', async (req, res) => {

  let animals = await getAnimal("animals", req.query.min, req.query.max);

  res.json({
    data: animals
  })
})

router.post('/check', async (req, res) => {

  const check = await checkAnimal(req.body.name.split(" "));

  res.json({
    data: [check]
  })
})

module.exports = router;