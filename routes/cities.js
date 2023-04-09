const express = require('express')
const router = express.Router();
const { getCity } = require('../scripts/cities');
const citiesData = require("../json/updatedCites.json")
// const cars = require('../json/cars.json');

router.get('/', async (req, res) => {

  let city = await getCity(req.query.min, req.query.max);

  res.json({
    data: city
  })
})


router.post('/check', async (req, res) => {

  let isValid = false;

  let check = await citiesData.filter((c) => c.city.toLowerCase().includes(req.body.name.toLowerCase()));

  if (check.length > 0) {
    isValid = true;
  }

  res.json({
    data: [isValid]
  })
})

module.exports = router;