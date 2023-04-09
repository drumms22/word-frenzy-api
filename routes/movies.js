const express = require('express')
const router = express.Router();
const { getMovie } = require('../scripts/movies');
const moviesData = require("../movies.json");
// const cars = require('../json/cars.json');

router.get('/', async (req, res) => {
  console.log(req.query);
  let movie = await getMovie(req.query.min, req.query.max);

  res.json({
    data: movie
  })
})


router.post('/check', async (req, res) => {

  let isValid = false;

  let check1 = await moviesData.filter((c) => c.title.toLowerCase().includes(req.body.name.toLowerCase()));
  const isTitleInSimilar = moviesData.some(movie => {
    return movie.similar && Array.isArray(movie.similar) && movie.similar.some(similarMovie => similarMovie.title.toLowerCase() === req.body.name.toLowerCase());
  });
  console.log(isTitleInSimilar);
  if (check1.length > 0 || isTitleInSimilar) {
    isValid = true;
  }

  res.json({
    data: [isValid]
  })
})

module.exports = router;