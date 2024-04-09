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

const predict = async (req, res) => {
    // 4.6,3.4,1.4,0.3
    const { id, values } = req.body;
    const info = db.get('instances').find({ 'id': id }).value();

    const spaceSparatedFeatures = info.features.join(' ').replace(/"/g, "'");
    console.log(spaceSparatedFeatures);

    try {
        const cmd = `python3 prediction.py --headers ${spaceSparatedFeatures} --values ${values}`;
        console.log(cmd);
        const result = await runExec(info.containerName, ['/bin/bash', '-c', cmd])
        console.log(result);
        res.status(200).json({ "result": `${result.replace(/[^\x20-\x7E]/g, '')}` });
    } catch(err) {
        return res.status(400);
    }

}

module.exports = {
    predict
}