const express = require('express')
const router = express.Router();
const { getUser, saveUser, updateUser } = require('../scripts/users');

router.get('/', async (req, res) => {

  let user = await getUser(req.query.id);

  res.json({
    data: [user]
  })
})


router.post('/save', async (req, res) => {

  let user = await saveUser(req.body.data);

  res.json({
    data: [user]
  })
})

router.post('/update', async (req, res) => {

  let updated = await updateUser(req.body);

  res.json({
    data: [updated]
  })
})

module.exports = router;