const express = require('express')
const router = express.Router();
const { getCar, checkCar } = require('../scripts/cars');
const cars = require('../json/cars.json');

router.get('/', async (req, res) => {

  let car = await getCar(req.query.min, req.query.max);

  res.json({
    data: car
  })
})


router.post('/check', async (req, res) => {

  let check = await checkCar(req.body.name)

  res.json({
    data: [check]
  })
})

module.exports = router;