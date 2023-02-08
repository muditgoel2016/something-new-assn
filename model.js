const tf = require('@tensorflow/tfjs-node');

const { trainingInputData,
    trainingTargetData,
    validationInputData,
    validationTargetData,
    maxLength,
    labels } = require("./dataPreprocessor.js");

async function buildModel() {

    // Define the model architecture
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 16, activation: "relu", inputShape: [maxLength] }));
    model.add(tf.layers.dense({ units: 16, activation: "relu" }));
    model.add(tf.layers.dense({ units: labels.length, activation: "softmax" }));

    // Compile the model
    model.compile({ loss: "categoricalCrossentropy", optimizer: "adam" })
    console.log('Model built and compiled successfully.')
    return model;
}

async function trainModel(model, xs, ys, ls, ms) {
    // Train the model
    const history = await model.fit(xs, ys, {
        epochs: 100,
        validationData: [ls, ms],
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                // console.log(`Model validation: Epoch ${epoch}: loss = ${logs.loss}`);
            }
        }
    });
    console.log('Model training done.')
    return history;
}

async function main() {
    // Build the model
    const model = await buildModel();

    // Prepare the training data
    const xs = tf.tensor2d(trainingInputData);
    const ys = tf.tensor2d(trainingTargetData);
    const ls = tf.tensor2d(validationInputData);
    const ms = tf.tensor2d(validationTargetData);

    console.log('Model fed training and validation data.');

    // Train the model
    await trainModel(model, xs, ys, ls, ms);

    // Save the model for future use
    await model.save('file://model');
}

main();
