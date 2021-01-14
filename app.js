const express = require('express');
const bodyParser = require('body-parser');
const downloader = require('./routes/downloader');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use('/api', downloader);

app.listen(3030);