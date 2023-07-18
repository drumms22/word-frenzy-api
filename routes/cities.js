const express = require('express')
const router = express.Router();
const { getCity, checkCity } = require('../scripts/cities');
const citiesData = require("../json/updatedCites.json")
// const cars = require('../json/cars.json');

router.get('/', async (req, res) => {

  let city = await getCity(req.query.min, req.query.max);

  res.json({
    data: city
  })
})


router.post('/check', async (req, res) => {

  let check = await checkCity(req.body.name);

  res.json({
    data: [check]
  })
})

module.exports = router;