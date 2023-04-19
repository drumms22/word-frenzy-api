const express = require('express');
const app = express();
var cors = require('cors')
const server = require('http').Server(app);
const io = require('socket.io')(server);
const pvpSocketHandler = require('./sockets/pvpSocketHandler')(io);
const port = process.env.PORT || 3000;
require('dotenv').config()

const hints = require('./routes/hints');
const users = require('./routes/users');
const invites = require('./routes/invites');
const routes = require('./routes');
const middleware = require('./routes/middleware');
const connectDB = require("./config/db");

app.use(cors({
  origin: '*'
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.send("Nothing but WORDS here :)");
});

app.use('/', middleware);
app.use('/categories', routes);
app.use('/hints', hints);
app.use('/users', users);
app.use('/lobby/invites', invites);

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Word Frenzy API listening on port ${port}`);
  });
})
