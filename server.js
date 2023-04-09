const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
var cors = require('cors')
require('dotenv').config()

const hints = require('./routes/hints');
const users = require('./routes/users');
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

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
})
