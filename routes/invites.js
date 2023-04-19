const express = require('express')
const router = express.Router();
const { getInvite, saveInvite, updateInvite, deleteInvite, getAllNotIn } = require('../scripts/invites');
const { getUser } = require('../scripts/users');

router.get('/', async (req, res) => {


  let invite = await getInvite(req.query);

  res.json({
    data: invite
  })
})


router.post('/save', async (req, res) => {

  let isValid = false;

  let playerTo = await getUser(req.body.playerTo);

  if (playerTo) {

    let checkInvite = await getInvite({ playerTo: playerTo._id });

    let checkIfThere = await checkInvite.filter((invite) => invite.playerFrom === req.body.playerFrom && !invite.accepted);

    if (checkIfThere.length === 0) {

      let save = await saveInvite(req.body.lobbyCode, req.body.playerFrom, playerTo._id);

      if (save) {
        isValid = true;
      }

    }

  }


  res.json({
    data: [isValid]
  })
})

router.post('/deny', async (req, res) => {

  let deleted = await deleteInvite(req.body.id);

  res.json({
    data: [deleted]
  })
})

router.get('/notin', async (req, res) => {

  let q = req.query;

  if (!q.hasOwnProperty("playerFrom")) {
    return res.json({
      data: []
    })

  }

  let notIn = await getAllNotIn(q.playerFrom);

  res.json({
    data: notIn
  })
})

module.exports = router;