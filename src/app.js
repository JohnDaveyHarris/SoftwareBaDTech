const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', version: '2' });
})

module.exports = app;