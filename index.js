let express = require('express');
let app = express();
let port = 3000;
let model;

const { maxLength, labels } = require("./dataPreprocessor.js");
const tf = require('@tensorflow/tfjs-node');

app.use(express.json())

const preprocessText = (text) => {
  // Tokenize the text
  const tokens = text.split(" ");
  // Convert the tokens into numerical values
  const vocabulary = {};
  let index = 0;
  const sequence = tokens.map(token => {
    if (!vocabulary[token]) {
      vocabulary[token] = index++;
    }
    return vocabulary[token];
  });

  // Pad or truncate the text to a fixed length
  while (sequence.length < maxLength) {
    sequence.push(0);
  }
  return [sequence];
}


async function predictLanguage(model, text) {
  // Preprocess the input text
  const inputData = preprocessText(text);

  // Predict the language
  const prediction = model.predict(tf.tensor2d(inputData, [1, maxLength]));
  const predictionArray = prediction.dataSync();
  const index = prediction.argMax(1).dataSync()[0];
  const language = labels[index];
  const languageProbability = predictionArray[index];

  return { language, languageProbability };

}

async function main() {
  // Load the model
  model = await tf.loadLayersModel('file://model/model.json');
  console.log('Model loaded');

  // Test the model with some example texts; Test Cases
  const texts = [
    { text: "Bonjour comment ça va?" },
    { text: "Guten Tag, wie geht es Ihnen?" },
    { text: "हम बस हर समय पा" },
    { text: "こんにちは、元気ですか？" },
    { text: "안녕하세요, 어떻게 지내고 있나요?" }
  ];
  for (const textItm of texts) {
    const { language, languageProbability } = await predictLanguage(model, textItm.text);
  }
}
main();

app.post('/myserver/lang_id', async (req, res) => {
  let text = req.body.text;
  const { language, languageProbability } = await predictLanguage(model, text);
  res.json({[language]: languageProbability});
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})