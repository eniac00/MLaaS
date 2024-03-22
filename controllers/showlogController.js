
const showlog = (req, res) => {
    const { id } = req.body;
    res.status(200).json({ "message": `in showlog ${id}` });
}

module.exports = {
    showlog
}