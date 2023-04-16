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


router.post('/check', (req, res) => {

  let isValid = false;

  let num = 0;
  if (req.body.sportC > 4) req.body.sportC = 4;
  switch (req.body.sportC) {
    case 0:
      const cMlb = mlb.filter((t) => t.name.toLowerCase().includes(req.body.name.toLowerCase()));
      num = cMlb.length;
      break;
    case 1:
      const cNfl = nfl.filter((t) => t.team.toLowerCase().includes(req.body.name.toLowerCase()));
      num = cNfl.length;
      break;
    case 2:
      const cNba = nba.filter((t) => t.shortName.toLowerCase().includes(req.body.name.toLowerCase()));
      num = cNba.length;
      break;
    case 3:
      const cNhl = nhl.filter((t) => t.shortName.toLowerCase().includes(req.body.name.toLowerCase()));
      num = cNhl.length;
      break;
    case 4:
      const cSWords = sportsWords.filter((t) => t.name.toLowerCase().includes(req.body.name.toLowerCase()));
      num = cSWords.length;
      break
  }

  if (num > 0) {
    isValid = true;
  }

  res.json({
    data: [isValid]
  })
})

module.exports = router;