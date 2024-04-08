const db = require('../config/db');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const csv = require('csv-parser');
const { format } = require('date-fns');
const Docker = require('dockerode');

const uid = new ShortUniqueId({ length: 10,  dictionary: 'hex'});


async function getCSVHeaders(csvFilePath) {
    return new Promise((resolve, reject) => {
        let headersArray = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('headers', (headers) => {
                headersArray = headers;
            })
            .on('data', () => {})
            .on('end', () => {
                resolve(headersArray);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}


const create = async (req, res) => {
    const { workName, learning, task, modelName, target } = req.body;
    const id = uid.rnd();
    const formattedDate = format(new Date(), 'dd MMMM yyyy, HH:mm'); 

    if (!req.files) res.status(400).json({ "message": "error happened" });

    const folderName = './resources/'+id;
    
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


    // Create a new Docker instance
    const docker = new Docker();

    // Create options for the new container
    const createOptions = {
        Image: 'ubuntu',
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true
    };

    // Create a new container
    docker.createContainer(createOptions, (err, container) => {
        if (err) {
            console.error(`Error creating container: ${err.message}`);
                res.status(400).json({"message": "error creating the container"});
        }

        // Inspect the container to get its name
        container.inspect((err, data) => {
            if (err) {
                console.error(`Error inspecting container: ${err.message}`);
                res.status(400).json({"message": "error inspecting the container"});
            }

            // Get the container name
            const containerName = data.Name.substring(1); // Remove the leading '/'

            // Start the container
            container.start((err) => {
            if (err) {
                console.error(`Error starting container: ${err.message}`);
                res.status(400).json({"message": "error starting the container"});
            }

            console.log(`Container ${containerName} started successfully`);
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
            });
        });
    });

}

module.exports = {
    create
}