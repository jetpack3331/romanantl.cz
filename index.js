const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('/', async(_, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
  });