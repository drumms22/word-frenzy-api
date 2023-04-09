const User = require('../models/User');

const getUser = async (id) => {

  try {


    const user = await User.findById(id);

    const jsonData = await JSON.parse(user.data);

    return jsonData;

  } catch (error) {
    console.log(error);
    return false;
  }
}

const saveUser = async (data) => {

  try {

    let str = JSON.stringify(data);

    const newUser = await new User({
      data: str
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


module.exports = {
  getUser,
  saveUser,
  updateUser
}