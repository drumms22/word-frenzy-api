const axios = require('axios');
const LobbyInvite = require('../models/LobbyInvite');
const { getUser } = require('./users');
const mongoose = require('mongoose');

const getInvite = async (queryObj) => {

  try {
    const invites = await LobbyInvite.find(queryObj);

    let newInvites = [];

    if (invites.length > 0) {
      // Use Promise.all() to wait for all the promises returned by map() to resolve
      newInvites = await Promise.all(invites.map(async (inv) => {
        let user = await getUser(inv.playerFrom);

        return { ...inv.toObject(), usernameFrom: user.username };
      }));
    }
    return newInvites;
  } catch (error) {
    console.error(error);
    return false;
  }
}

const saveInvite = async (lobbyCode, playerFrom, playerTo) => {

  const updatedInvite = await LobbyInvite.findOneAndUpdate({ lobbyCode: lobbyCode }, { accepted: true }, { new: true });
  try {

    const newInvite = await new LobbyInvite({
      lobbyCode,
      playerFrom,
      playerTo
    });

    let save = await newInvite.save();

    if (!save) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }

}
const updateInvite = async (lobbyCode) => {
  try {

    const updatedInvite = await LobbyInvite.findOneAndUpdate({ lobbyCode }, { accepted: true }, { new: true });

    if (!updatedInvite) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
const deleteInvite = async (id) => {

  try {

    const result = await LobbyInvite.deleteOne({ _id: id });
    if (result.deletedCount === 1) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    console.log(error);
    return false;
  }
}

const getAllNotIn = async (playerFrom) => {

  try {

    let users = await User.find({
      username: { $ne: playerFrom },
      _id: { $nin: await LobbyInvite.distinct('playerTo', { accepted: false, playerFrom: playerFrom }) }
    }, { username: 1 });

    let filtered = await users.filter((u) => u._id.toString() !== playerFrom && u.username && u.username !== " " && u.username !== "");

    return filtered;

  } catch (error) {
    console.log(error);
    return [];
  }

}

module.exports = {
  getInvite,
  saveInvite,
  updateInvite,
  deleteInvite,
  getAllNotIn
}