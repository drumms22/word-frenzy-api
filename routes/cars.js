const express = require('express')
const router = express.Router();
const { getCar } = require('../scripts/cars');
const cars = require('../json/cars.json');

router.get('/', async (req, res) => {

  let car = await getCar(req.query.min, req.query.max);

  res.json({
    data: car
  })
})


router.post('/check', async (req, res) => {

  let isValid = false;

  let word = req.body.name;

  console.log(word);

  let check = await cars.filter((c) => c.model.includes(req.body.name) || c.make.includes(req.body.name));

  if (check.length > 0) {
    isValid = true;
  }

  res.json({
    data: [isValid]
  })
})

module.exports = router;