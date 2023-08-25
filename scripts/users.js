const User = require('../models/User');
const Lobby = require('../models/Lobby');
const GenUsername = require('../models/GenUsername');
const mongoose = require('mongoose');
const names = require('../json/names.json')

const getUser = async (data) => {

  try {

    const isValidObjectId = mongoose.Types.ObjectId.isValid(data);

    let user;

    if (isValidObjectId) {
      user = await User.findOne({ _id: data }); // search by _id field

    } else {
      user = await User.findOne({ username: data + "" }); // search by username field

    }


    return user;

  } catch (error) {
    console.log(error);
    return false;
  }
}

const getAllUsers = async () => {
  try {
    const users = await User.find({});
    return users;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const saveUser = async (data, username) => {

  try {

    let str = JSON.stringify(data);

    let checkUsername = await getUser(username);

    if (checkUsername) {
      return false;
    }

    const newUser = await new User({
      data: str,
      username
    })
    const save = await newUser.save();

    return save.id;

  } catch (error) {
    console.log(error);
    return false;
  }

}

const updateUser = async (toBeUpdated) => {

  try {

    let parsed = JSON.parse(toBeUpdated.data);



    const updated = await User.findByIdAndUpdate(
      { _id: toBeUpdated.id },
      { $set: { gameData: parsed, data: toBeUpdated.data } },
      { new: true }
    );

    if (!updated) {
      return false;
    }

    return true;

  } catch (error) {
    console.log(error);
    return false;
  }

}


const updateUsername = async (id, name) => {

  try {


    const updated = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { username: name } },
      { new: true }
    );

    if (!updated) {
      return false;
    }

    return true;

  } catch (error) {
    console.log(error);
    return false;
  }

}

const generateUsername = async () => {
  let username = '';
  const maxDigits = 5;
  const fNames = names.filter((n) => n.length < 6);
  const randomIndex = Math.floor(Math.random() * fNames.length);
  const randomName = fNames[randomIndex];
  const randomNum = Math.floor(Math.random() * (10 ** maxDigits)).toString().padStart(maxDigits, '0');
  username = `${randomName}${randomNum}`;

  let existingUsername = await GenUsername.findOne({ username });
  while (existingUsername) {
    const randomNum = Math.floor(Math.random() * (10 ** maxDigits)).toString().padStart(maxDigits, '0');
    username = `${randomName}${randomNum}`;
    existingUsername = await GenUsername.findOne({ username });
  }

  const newUsername = new GenUsername({ username });
  await newUsername.save();
  return username;
}

const calcSpeed = async (id) => {
  try {

    const result = await Lobby.find({
      'players.id': id,
      'players.timeSpent': { $gt: 0 }
    }).sort({ created: -1 }).limit(3);

    let totalChar = 0;
    let totalTime = 0;

    let playerRes = [];

    for (const game of result) {
      let p = game.players.filter((x) => x.id.toString() === id);

      playerRes.push(p[0]);
    }

    for (const res of playerRes) {

      let charCount = res.wordsGuessed
        .join("") // combine all strings in the array
        .replace(/\s+/g, "") // remove all whitespace characters
        .split("") // split into an array of characters
        .length;
      let t = res.timeSpent ? res.timeSpent : 0;

      totalTime += t;
      totalChar += charCount;
    }



    // update the user's game data with the new speed
    let updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          'gameData.speedData': {
            totalChar,
            totalTime
          }
        }
      },
      { new: true }
    );

    if (updatedUser) {
      return updatedUser
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}


const batchUpdateStats = async (playerStats) => {
  const updateOps = playerStats.map(playerData => ({
    updateOne: {
      filter: { _id: playerData.id },
      update: { $set: { gameData: JSON.parse(playerData.data), data: playerData.data } },
    }
  }));

  try {
    const result = await User.bulkWrite(updateOps);
    if (result.modifiedCount > 0) {
      console.log("Bulk Stats Updated");
    } else {
      console.log("Bulk Stats not Updated");
    }
  } catch (error) {
    console.log(error);
  }
}

const batchCalcSpeeds = async (players) => {
  try {
    let bulkWriteOperations = [];
    let updatedPlayers = [];

    for (const player of players) {

      const result = await Lobby.find({
        'players.id': player.id,
        'players.timeSpent': { $gt: 0 }
      }).sort({ created: -1 }).limit(3);

      let totalChar = 0;
      let totalTime = 0;

      let playerRes = [];

      for (const game of result) {
        let p = await game.players.filter((x) => x.id.toString() === player.id);

        await playerRes.push(p[0]);
      }

      for (const res of playerRes) {
        let t = res.timeSpent ? res.timeSpent : 0;
        let charCount = await res.wordsGuessed
          .join("") // combine all strings in the array
          .replace(/\s+/g, "") // remove all whitespace characters
          .split("") // split into an array of characters
          .length;

        totalTime += t;
        totalChar += charCount;
      }

      bulkWriteOperations.push({
        updateOne: {
          filter: { _id: player.id },
          update: {
            $set: {
              'gameData.speedData': {
                totalChar,
                totalTime
              }
            }
          }
        }
      });

      updatedPlayers.push({
        id: player.id,
        gameData: {
          speedData: {
            totalChar,
            totalTime
          }
        }
      });
    }


    if (bulkWriteOperations.length > 0) {
      await User.bulkWrite(bulkWriteOperations, { ordered: false });
    }

    return updatedPlayers;

  } catch (error) {
    console.log(error);
    return false;
  }
}


module.exports = {
  getUser,
  saveUser,
  updateUser,
  updateUsername,
  generateUsername,
  calcSpeed,
  batchUpdateStats,
  batchCalcSpeeds,
  getAllUsers
}