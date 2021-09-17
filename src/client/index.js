const express = require('express')
const app = express()
const {updateIntent, createIntent, queryResult, listIntents} = require('./dialogflow')

app.use(express.json())


app.post('/query', async (req, res) => {
  let result = await queryResult(req.body.message)
  res.send(result)
})

app.post('/create', async (req, res) => {
  let intentName = req.body.intentName
  let trainingText = req.body.trainingText
  let responseText = req.body.responseText
  let result = await createIntent(intentName, trainingText, responseText)
  res.send(result)
})

app.get('/', async (req, res) => {
  let result = await listIntents()
  res.send(result)
})

app.put('/update', async (req, res) => {
  let intentName = req.body.intentName
  let trainingText = req.body.trainingText
  let responseText = req.body.responseText
  let result = await updateIntent(intentName, trainingText, responseText)
  res.send(result)
})




const PORT = process.env.PORT || 30000
app.listen(PORT, () => console.log(`app running at port ${PORT}`))