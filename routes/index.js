const express = require('express')
const router = express.Router();
const animals = require("./animals");
const words = require('./words');
const cars = require('./cars');
const cities = require('./cities');
const sports = require('./sports');
const movies = require('./movies');

router.use("/animals", animals);
router.use("/words", words);
router.use("/cars", cars);
router.use("/cities", cities);
router.use("/sports", sports);
router.use("/movies", movies);

module.exports = router;