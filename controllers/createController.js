const db = require('../config/db');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const csv = require('csv-parser');
const { format } = require('date-fns');
const Docker = require('dockerode');

const uid = new ShortUniqueId({ length: 10, dictionary: 'hex' });


async function getCSVHeaders(csvFilePath) {
    return new Promise((resolve, reject) => {
        let headersArray = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('headers', (headers) => {
                headersArray = headers;
            })
            .on('data', () => { })
            .on('end', () => {
                resolve(headersArray);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

async function dockerCreateContainer() {
    return new Promise((resolve, reject) => {
        const docker = new Docker();

        // Create options for the new container
        const createOptions = {
            Image: 'heart',
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            HostConfig: {
                NetworkMode: 'host'  // Set network mode to host
            }
        };

        // Create a new container
        docker.createContainer(createOptions, (createErr, container) => {
            if (createErr) {
                console.error(`Error creating container: ${createErr.message}`);
                reject(new Error("Error creating the container"));
                return; // Terminate execution to prevent further execution
            }

            // Inspect the container to get its name
            container.inspect((inspectErr, data) => {
                if (inspectErr) {
                    console.error(`Error inspecting container: ${inspectErr.message}`);
                    container.remove(); // Remove the container since it's in an invalid state
                    reject(new Error("Error inspecting the container"));
                    return; // Terminate execution to prevent further execution
                }

                // Get the container name
                const containerName = data.Name.substring(1); // Remove the leading '/'

                // Start the container
                container.start((startErr) => {
                    if (startErr) {
                        console.error(`Error starting container: ${startErr.message}`);
                        container.remove(); // Remove the container since it's in an invalid state
                        reject(new Error("Error starting the container"));
                        return; // Terminate execution to prevent further execution
                    }

                    console.log(`Container ${containerName} started successfully`);
                    resolve(containerName);
                });

                // docker.getContainer(containerName).stop((stopErr) => {
                //     if (stopErr) {
                //         console.error(`Error stopping container: ${stopErr.message}`);
                //         reject(new Error("Error stopping the container"));
                //         return; // Terminate execution to prevent further execution
                //     }

                //     console.log(`Container ${containerName} stopped successfully`);
                //     resolve(containerName);
                // });
            });
        });
    });
}



const create = async (req, res) => {
    const { workName, learning, task, modelName, target } = req.body;
    const id = uid.rnd();
    const formattedDate = format(new Date(), 'dd MMMM yyyy, HH:mm');

    if (!req.files) res.status(400).json({ "message": "error happened" });

    const folderName = './resources/' + id;

    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
    } catch (err) {
        console.log(err);
    }

    const file = req.files.csvFile;
    const csvFile = folderName + '/' + 'data.csv';
    file.mv(csvFile);


    const csvHeaders = await getCSVHeaders(csvFile);
    const features = csvHeaders.filter((header) => header != target);

    try {
        const containerName = await dockerCreateContainer();

        if (!containerName) res.status(404).json({ "message": "container not created" });
        
        const record = {
                'id': id,
                'workName': workName,
                'createdAt': formattedDate,
                'containerName': containerName,
                'status': 'trainable',
                'learning': learning,
                'task': task,
                'modelName': modelName,
                'target': target,
                'csvFile': csvFile,
                'features': features
            }

        db.get('instances')
            .push(record)
            .write();

        res.redirect('/show');
    } catch (err) {
        console.error(err);
        res.status(400).json({ "error": err })
    }
}

module.exports = {
    create
}