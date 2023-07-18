const cron = require('node-cron');
const { deleteUnused } = require('../scripts/lobbies');
// Schedule a cron job to run every minute
module.exports = cron.schedule('0 0 1 * *', () => {
  deleteUnused();
});