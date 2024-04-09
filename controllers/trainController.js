const db = require('../config/db');
const path = require('path');
const Docker = require('dockerode');
const tarStream = require('tar-stream');
const fs = require('fs');


async function copyCsvToContainerAndRunCommandDetached(info) {
    return new Promise((resolve, reject) => {
        const docker = new Docker();

        // Get the container by name
        const container = docker.getContainer(info.containerName);

        // Create a tar stream with the CSV file
        const tar = tarStream.pack();
        tar.entry({ name: 'data.csv' }, fs.readFileSync(info.csvFile));
        tar.finalize();

        // Copy the tar stream to the container
        container.putArchive(tar, { path: '/app' }, (err) => {
            if (err) {
                console.error(`Error copying file to container: ${err.message}`);
                reject(new Error("Error copying file to container"));
                return;
            }
            console.log(`File copied to container ${info.containerName}`);

            // Run the command inside the container in detached mode
            container.exec({
                Cmd: ['sh', '-c', `cd /app && python3 train.py --learning  ${info.learning} --task ${info.task} --model ${info.modelName} --csv ./data.csv --target ${info.target}`],
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Detach: true // Execute the command in detached mode
            }, (execErr, execObj) => {
                if (execErr) {
                    console.error(`Error executing command inside container: ${execErr.message}`);
                    reject(new Error("Error executing command inside container"));
                    return;
                }

                // Log the ID of the detached command
                console.log(`Command executed in detached mode with ID: ${execObj.id}`);
                resolve();
            });
        });
    });
}

const train = async (req, res) => {
    const { id } = req.body;

    const info =  db.get('instances').find({ id: id }).value();

    try {

        await copyCsvToContainerAndRunCommandDetached(info);

        res.status(200).json({ "message": `in train ${id}` });
    } catch (err) {
        res.status(400).json(err.message);
    }

    

}

module.exports = {
    train
}