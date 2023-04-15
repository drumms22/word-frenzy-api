const express = require('express')
const router = express.Router();
const { getUser, saveUser, updateUser, updateUsername } = require('../scripts/users');

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
    updated = await updateUser(req.body);
  }
  if (req.body.hasOwnProperty("username")) {
    updated = await updateUsername(req.body.id, req.body.username);
  }


  res.json({
    data: [updated]
  })
})

module.exports = router;