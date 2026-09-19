const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.status(200).json({status: 'OK'});
})

app.get('/about', (req, res) => {
    res.status(200).json({about: 'lab1'});
});

module.exports = app;