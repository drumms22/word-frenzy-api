const express = require('express')
const router = express.Router();
const { checkProfanity } = require('../scripts/words');
// Add the app.all() middleware function for paths that end in "check"
router.all('*check', async (req, res, next) => {
  let checkProf = await checkProfanity(req.body.name);

  if (checkProf) {
    return res.json({
      data: [false]
    })
  }
  // Handle the request here
  next();
});

module.exports = router;