const express = require('express')
const router = express.Router();
const { getMovie, checkMovie } = require('../scripts/movies');

router.get('/', async (req, res) => {

  let movie = await getMovie(req.query.min, req.query.max);

  res.json({
    data: movie
  })
})


router.post('/check', async (req, res) => {

  let check = await checkMovie(req.body.name);

  res.json({
    data: [check]
  })
})

module.exports = router;