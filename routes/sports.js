const express = require('express')
const router = express.Router();
const { getSport, checkSport } = require('../scripts/sports');
// const citiesData = require("../json/updatedCites.json")
// const cars = require('../json/cars.json');
const mlb = require("../json/mlb.json");
const nfl = require("../json/nfl.json");
const nba = require("../json/nba.json");
const nhl = require("../json/nhl.json");
const sportsWords = require("../json/sportWords.json");

router.get('/', async (req, res) => {

  let sport = await getSport();

  res.json({
    data: sport
  })
})


router.post('/check', async (req, res) => {

  let check = await checkSport(req.body.name);

  res.json({
    data: [check]
  })
})

module.exports = router;