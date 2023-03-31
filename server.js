const express = require('express');
const app = express();
const port = 3000;
var cors = require('cors')
const words = require('./routes/words');



app.use(cors());

app.get('/', function (req, res) {
  res.send("Nothing but WORDS here :)");
});
app.use('/words', words);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});