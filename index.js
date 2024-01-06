const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async(_, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.NODE_ENV === 'development' ? 8080 : 80;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });