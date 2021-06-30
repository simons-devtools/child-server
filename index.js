const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
// const ObjectId = require('mongodb').ObjectID;
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Mongodb connection:
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eeqsr.mongodb.net/${process.env.DB_SERVICES}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Call the all packages:
const app = express()
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Hello Child-Care-Server, I'm ready for working environment!")
})

// Mongodb collection connection:
client.connect(err => {
    const servicesCollection = client.db(`${process.env.DB_SERVICES}`).collection(`${process.env.DB_SERVICE}`);
    console.log('Mongodb services database is ready');
    const reviewsCollection = client.db(`${process.env.DB_REVIEWS}`).collection(`${process.env.DB_REVIEW}`);
    console.log('Mongodb reviews database is ready');
    const ordersCollection = client.db(`${process.env.DB_ORDERS}`).collection(`${process.env.DB_ORDER}`);
    console.log('Mongodb orders database is ready');

    // POST data/services to mongodb cloud:
    app.post('/addServices', (req, res) => {
        const newService = req.body;
        servicesCollection.insertOne(newService)
            .then(result => {
                // console.log('Result=', result);
                res.send(result.insertedCount > 0)
            })
    })

    // GET all services from MDB cloud:
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, services) => {
                res.send(services)
            })
    })

    // -----------------------------------------------------
    // Post users reviews to MDB cloud:
    app.post('/addReviews', (req, res) => {
        const newReview = req.body;
        reviewsCollection.insertOne(newReview)
            .then(result => {
                // console.log('Result=', result);
                res.send(result.insertedCount > 0)
            })
    })

    // GET users reviews from MDB cloud:
    app.get('/reviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, reviews) => {
                res.send(reviews)
            })
    })

    // -----------------------------------------------------
    // Post order to the MDB cloud:
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0);
            })
    })



});






app.listen(port);