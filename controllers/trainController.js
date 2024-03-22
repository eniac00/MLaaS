

const train = (req, res) => {
    const { id } = req.body;
    res.status(200).json({ "message": `in train ${id}` });
}

module.exports = {
    train
}