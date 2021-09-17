const dialogflow = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

async function queryResult(messages) {
    // A unique identifier for the given session
    const sessionId = uuidv4();

    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(
      process.env.PROJECT_ID,
      sessionId
    );

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: messages,
          // The language used by the client (en-US)
          languageCode: 'en-US',
        },
      },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    //console.log(result.fulfillmentMessages[0].payload)
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    // console.log(`  Response: ${result.fulfillmentMessages[0].payload.fields.msg.stringValue}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log('  No intent matched.');
    }
    return result
  }
async function updateIntent(intentName, trainingText, responseText){

  const intentsClient = new dialogflow.v2.IntentsClient()
  const projectAgentPath = intentsClient.projectAgentPath(process.env.PROJECT_ID)

  const request = {
    parent:projectAgentPath,
    intentView:'INTENT_VIEW_FULL'
  }

  try{
    const [response] = await intentsClient.listIntents(request)
    response.forEach(async intent => {
        if (intent.displayName == intentName){
            trainingText.forEach(text => {
                const trainingPhrases = {
                    name:uuidv4(),
                    parts:[]
                }
                let part = {
                    text:text,
                }
                trainingPhrases.parts.push(part)
                intent.trainingPhrases.push(trainingPhrases)
            })
            responseText.forEach(resText => {
                intent.messages[0].text.text.push(resText)
            })
            request.intent = intent
            return await intentsClient.updateIntent(request)
        }
    })
    return "Update Successfully"
  }
  catch(err){
      console.log(err)
      return Promise.reject()
  }
}

async function createIntent(intentName, trainingText, responseText){
    const intentsClient = new dialogflow.v2.IntentsClient()
    const projectAgentPath = intentsClient.projectAgentPath(process.env.PROJECT_ID)

    const request = {
      parent:projectAgentPath,
      intentView:'INTENT_VIEW_FULL'
      // intent:{
      //   displayName:'test'
      // }
    }
    try{
        let intent = {
            displayName:intentName
        }
        if (trainingText.length > 0){
            intent.trainingPhrases = []
            trainingText.forEach(text => {
                const trainingPhrases = {
                    name:uuidv4(),
                    parts:[]
                }
                let part = {
                    text:text,
                }
                trainingPhrases.parts.push(part)
                intent.trainingPhrases.push(trainingPhrases)
            })
        }
        if (responseText.length > 0){
            intent.messages = []
            let responseMsg = {
                message:'text',
                text:{
                    text:responseText
                }
            }
            intent.messages.push(responseMsg)
        }
        request.intent = intent
        let result = await intentsClient.createIntent(request)
        return result
    }
    catch(err){
        console.log(err)
        return Promise.reject()
    }
}

async function listIntents(){
    const intentsClient = new dialogflow.v2.IntentsClient()
    const projectAgentPath = intentsClient.projectAgentPath(process.env.PROJECT_ID)

    const request = {
      parent:projectAgentPath,
      intentView:'INTENT_VIEW_FULL'
      // intent:{
      //   displayName:'test'
      // }
    }
    try{
       const [response] = await intentsClient.listIntents(request)
       return response
    }
    catch(err){
        console.log(err)
        return Promise.reject()
    }
}
module.exports = {
    createIntent,
    updateIntent,
    queryResult,
    listIntents
}