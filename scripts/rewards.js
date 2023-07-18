const Reward = require('../models/Reward');

const getReward = async (query) => {
  try {
    const rewards = await Reward.find(query);
    return rewards;
  } catch (error) {
    console.log(error);
    return [];
  }
}
const saveReward = async (name, description, points, badgeImageUrl) => {
  try {
    const reward = new Reward({
      name: name,
      description: description,
      points: points,
      badgeImageUrl: badgeImageUrl
    });
    const savedReward = await reward.save();
    console.log(`New reward ${savedReward.name} saved with id ${savedReward._id}`);
    return savedReward;
  } catch (error) {
    console.error(`Error saving reward: ${error}`);
    throw error;
  }
}

module.exports = {
  getReward,
  saveReward
}