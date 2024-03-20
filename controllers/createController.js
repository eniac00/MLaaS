const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
 
const adapter = new FileSync('db.json');
const db = low(adapter);
const uid = new ShortUniqueId({ length: 10,  dictionary: 'hex'});


const create = async (req, res) => {
    const { workName, task, modelName, target } = req.body;
    const id = uid.rnd();

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

    db.get('instances')
        .push({ 
            'id': id, 
            'workName': workName,
            'task': task,
            'modelName': modelName,
            'target': target,
            'csvFile': csvFile
        })
        .write();

    res.status(200).json({ "message": "recieved the data" });
}

module.exports = {
    create
}