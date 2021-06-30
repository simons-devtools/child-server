const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
// const ObjectId = require('mongodb').ObjectID;
// const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const port = process.env.PORT || 5000;

// Call the packages
const app = express()
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Hello Child-Care-Server, I'm ready for working environment!")
})








app.listen(port);