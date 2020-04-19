const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json());

const port = 3000

app.post('/github', (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  res.send('Hello World!')
})

const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
module.exports = server;
