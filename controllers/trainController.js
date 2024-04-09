const db = require('../config/db');
const path = require('path');
const Docker = require('dockerode');
const tarStream = require('tar-stream');
const fs = require('fs');

async function runExec(containerName, command) {
    const docker = new Docker();
    const container = docker.getContainer(containerName);

    return new Promise((resolve, reject) => {
        container.exec({
            Cmd: command,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false, // Disable TTY to run in detached mode
            Detach: true // Execute the command in detached mode
        }, (err, exec) => {
            if (err) {
                reject(err);
                return;
            }

            exec.start({}, (startErr, stream) => {
                if (startErr) {
                    reject(startErr);
                    return;
                }

                let output = '';
                stream.setEncoding('utf8');
                stream.on('data', (data) => {
                    output += data.toString();
                });

                stream.on('end', () => {
                    resolve(output);
                });

                stream.on('error', (streamErr) => {
                    reject(streamErr);
                });
            });
        });
    });
}




async function copyCsvToContainer(containerName, csvFilePath, destinationPath) {
    return new Promise((resolve, reject) => {
        const docker = new Docker();

        // Get the container by name
        const container = docker.getContainer(containerName);

        // Create a tar stream with the CSV file
        const tar = tarStream.pack();
        tar.entry({ name: 'data.csv' }, fs.readFileSync(csvFilePath));
        tar.finalize();

        // Copy the tar stream to the container
        container.putArchive(tar, { path: destinationPath }, (err) => {
            if (err) {
                console.error(`Error copying file to container: ${err.message}`);
                reject(new Error("Error copying file to container"));
                return;
            }
            console.log(`File copied to container ${containerName}`);
            resolve();
        });
    });
}



const train = async (req, res) => {
    const { id } = req.body;

    const info =  db.get('instances').find({ id: id }).value();
    // console.log(info);

    try {
        await copyCsvToContainer(info.containerName, info.csvFile, '/app');
        const cmd = `python3 train.py --dbid ${info.id} --learning ${info.learning} --task ${info.task} --model ${info.modelName} --csv data.csv --target ${info.target}`;
        // const output = await runExec(info.containerName, ['/bin/bash', '-c', cmd]);
        // console.log(output);
        runExec(info.containerName, ['/bin/bash', '-c', cmd]);
        res.redirect('/show');
    } catch (err) {
        res.status(400).json(err.message);
    }
}

module.exports = {
    train
}