const fs = require('fs');

function getSequences(data) {
    // Tokenize the text
    let tokens = data.map(d => d.text.split(" "));

    // Convert the tokens into numerical values
    const vocabulary = {};
    let index = 0;
    const sequences = tokens.map(sequence => {
        return sequence.map(token => {
            if (!vocabulary[token]) {
                vocabulary[token] = index++;
            }
            return vocabulary[token];
        });
    });
    return sequences;
}

const preprocessText = (data, maxLength) => {

    const sequences = getSequences(data);
    // Pad or truncate the text to a fixed length
    const inputData = sequences.map(sequence => {
        while (sequence.length < maxLength) {
            sequence.push(0);
        }
        return sequence;
    });

    return inputData;
}

const oneHotEncode = (data, labels) => {
    // One-hot encode the labels
    const labelEncoder = {};
    labels.forEach((label, i) => {
        labelEncoder[label] = Array(labels.length).fill(0);
        labelEncoder[label][i] = 1;
    });

    const targetData = data.map(d => labelEncoder[d.label]);

    return targetData;
}

function main() {
    //Fetch and process language data-set
    let data;

    // const dataFormat = [
    //     { text: "This is some text", label: "English" },
    //     { text: "Ceci est du texte", label: "French" },
    //     { text: "Dies ist ein Text", label: "German" }
    // ];

    try {
        let fileData = fs.readFileSync('data-set.json');
        let lngCodeMapData = fs.readFileSync('alpha-2.json');
        let jsonData = JSON.parse(fileData);
        let jsonLngCodeMapData = JSON.parse(lngCodeMapData);
        data = jsonData.map(element => element.row);
        data = data.map(dat => {
            let found = jsonLngCodeMapData.filter(mp => mp['alpha2'] === dat['label'])[0];
            dat['label'] = found['English'];
            return dat;
        });
    } catch (error) {
        console.error(error);
    }
    // Determine the maximum length of the sequences
    const sequences = getSequences(data);
    const maxLength = Math.max(...sequences.map(s => s.length));
    const labels = [...new Set(data.map(d => d.label))];

    const trainingInputData = preprocessText(data.slice(0, Math.floor(data.length * 0.8)), maxLength);
    const validationInputData = preprocessText(data.slice(Math.floor(data.length * 0.8)), maxLength);

    const trainingTargetData = oneHotEncode(data.slice(0, Math.floor(data.length * 0.8)), labels);
    const validationTargetData = oneHotEncode(data.slice(Math.floor(data.length * 0.8)), labels);

    // console.log("Training input/text data:", trainingInputData);
    // console.log("Validation input/text data:", validationInputData);
    // console.log("Training target/label data:", trainingTargetData);
    // console.log("Validation target/label data:", validationTargetData);
    console.log('Data preprocessing done.');
    return { trainingInputData, validationInputData, trainingTargetData, validationTargetData, maxLength, labels };

}

let { trainingInputData, validationInputData, trainingTargetData, validationTargetData, maxLength, labels } = main();

module.exports = {
    trainingInputData,
    trainingTargetData,
    validationInputData,
    validationTargetData,
    maxLength,
    labels
}

//Common Crawl Corpus, European Parliament Proceedings, multilingual TED corpus.