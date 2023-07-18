const express = require('express')
const router = express.Router();
const { getUser, saveUser, updateUser, updateUsername, calcSpeed } = require('../scripts/users');
const { calcWordPoints } = require('../scripts/lobbies');

router.get('/', async (req, res) => {

  let user = await getUser(req.query.id);

  res.json({
    data: [user]
  })
})


router.post('/save', async (req, res) => {

  let user = await saveUser(req.body.data, req.body.username);

  res.json({
    data: [user]
  })
})

router.post('/update', async (req, res) => {

  let updated = false;
  if (req.body.hasOwnProperty("data")) {
    let d = req.body.data.replace(/'/g, '"');

    let obj = req.body;

    obj.data = d;

    updated = await updateUser(obj);
  }
  if (req.body.hasOwnProperty("username")) {
    updated = await updateUsername(req.body.id, req.body.username);
  }


  res.json({
    data: [updated]
  })
})

router.post('/calcspeed', async (req, res) => {

  let updated = await calcSpeed(req.body.id);


  res.json({
    data: [updated]
  })
})

module.exports = router;