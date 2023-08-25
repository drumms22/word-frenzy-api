const { getInvite } = require('../scripts/invites');
const { getUser, saveUser, updateUsername } = require('../scripts/users');

module.exports = function (io, socket) {

  const checkUsername = async (username) => {
    let match = /^[a-zA-Z0-9@!_$]+$/.test(username);
    if (username.length < 3 || username.length > 10 || !match) {
      return;
    }
    let user = await getUser(username);
    let check = true;
    if (!user) {
      check = false
    }

    return check;
  }

  socket.on('getInvites', async (userId) => {

    let invites = await getInvite({ playerTo: userId });

    socket.emit('getInvites', invites.filter((i) => !i.accepted));

  })

  socket.on('checkUsername', async (username) => {
    let check = await checkUsername(username)
    socket.emit('checkUsername', check);
  })

  socket.on('checkUpdatedUsername', async (username) => {
    let check = await checkUsername(username)
    socket.emit('checkUpdatedUsername', check);
  })

  socket.on('createUser', async (username) => {
    socket.emit('loading');
    let obj = {
      totalPoints: 0,
      totalTimeSpent: 0,
      totalChallengesCompleted: 0,
      totalWordsCompleted: 0,
      totalCharCount: 0,
      speedData: {
        totalChar: 15,
        totalTime: 300
      }
    };

    let user = await saveUser(JSON.stringify(obj), username);

    if (!user) {
      socket.emit('notLoading');
      return;
    }

    socket.emit('createUser', { id: user, username, gameData: obj });

  })
  socket.on('getUser', async (data) => {
    socket.emit('loading');
    let user = await getUser(data);


    socket.emit('getUser', user);

  })

  socket.on('updateUsername', async (data) => {
    socket.emit('loading');
    let updated = await updateUsername(data.playerId, data.username);

    socket.emit('updateUsername', { updated, username: data.username });

  })

}