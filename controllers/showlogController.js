const Docker = require('dockerode');
const db = require('../config/db');
const tarStream = require('tar-stream');
const fs = require('fs');
const { exec } = require('child_process');

function copyFileFromContainer(containerName, sourcePath, destinationPath) {
    return new Promise((resolve, reject) => {
        // Construct the Docker cp command
        const command = `docker cp ${containerName}:${sourcePath} ${destinationPath}`;

        // Execute the command
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                reject(error);
            } else if (stderr) {
                console.error(`Command stderr: ${stderr}`);
                reject(stderr);
            } else {
                // console.log(`File copied successfully from ${containerName}:${sourcePath} to ${destinationPath}`);
                resolve(stdout);
            }
        });

        // Log the output of the command
        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        // Log any errors
        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    });
}

async function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        // Read the JSON file
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err); // Reject the promise if there is an error
                return;
            }

            try {
                // Parse the JSON data and resolve the promise with the JSON object
                const jsonObject = JSON.parse(data);
                resolve(jsonObject);
            } catch (parseError) {
                reject(parseError); // Reject the promise if there is an error while parsing JSON
            }
        });
    });
}


const showlog = async (req, res) => {
    const containerName = req.params.containerName;
    const info = db.get('instances').find({ 'containerName': containerName }).value();
    const logFile = info.csvFile.replace("data.csv", "log.json");

    try {
        await copyFileFromContainer(containerName, '/app/log.json', logFile);
        const logJSON = await readJsonFile(logFile);
        return res.status(200).json(logJSON);
    } catch(err) {
        return res.status(400).json(err.message);
    }
}

module.exports = {
    showlog
}