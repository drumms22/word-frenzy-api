const User = require('../models/User');
const mongoose = require('mongoose');
const getUser = async (data) => {

  try {


    const isValidObjectId = mongoose.Types.ObjectId.isValid(data);

    let user;

    if (isValidObjectId) {
      user = await User.findOne({ _id: data }); // search by _id field
    } else {
      user = await User.findOne({ username: data }); // search by username field
    }

    return user;

  } catch (error) {
    console.log(error);
    return false;
  }
}

const saveUser = async (data, username) => {

  try {

    let str = JSON.stringify(data);

    let checkUsername = await getUser(username);

    console.log(checkUsername);

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


    const updated = await User.findByIdAndUpdate(
      { _id: toBeUpdated.id },
      { $set: { data: JSON.stringify(toBeUpdated.data[0]) } },
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

module.exports = {
  getUser,
  saveUser,
  updateUser,
  updateUsername
}