

const predict = (req, res) => {
    const { id } = req.body;
    res.status(200).json({ "message": `in predict ${id}` });
}

module.exports = {
    predict
}