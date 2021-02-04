const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000

let inputValue = ''

app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send(inputValue)
})

app.post('/', (req, res) => {
  inputValue = req.body.value;
  console.log(inputValue);
  res.send('Your input field submitted, teehee.');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})