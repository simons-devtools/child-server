const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectID;
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

// Admin service account:

const admin = require("firebase-admin");
const serviceAccount = require("./configs/child-care-6782b-firebase-adminsdk-ahkh5-328b68450e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


app.get('/', (req, res) => {
    res.send("Hello Child-Care-Server, I'm ready for working!")
})

// Mongodb collection connection:
client.connect(err => {
    const servicesCollection = client.db(`${process.env.DB_SERVICES}`).collection(`${process.env.DB_SERVICE}`);
    const reviewsCollection = client.db(`${process.env.DB_REVIEWS}`).collection(`${process.env.DB_REVIEW}`);
    const ordersCollection = client.db(`${process.env.DB_ORDERS}`).collection(`${process.env.DB_ORDER}`);
    const adminCollection = client.db(`${process.env.DB_ADMINS}`).collection(`${process.env.DB_ADMIN}`);
    console.log('Mongodb database connention is ready');

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

    // Cancel service order:
    app.delete('/deleteServiceOne/:id', (req, res) => {
        servicesCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                // console.log(result);
                res.send(result.deletedCount > 0);
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
    // Post admins account to MDB cloud:
    app.post('/addAdmins', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
            .then(result => {
                // console.log('Result=', result);
                res.send(result.insertedCount > 0)
            })
    })

    // GET admins account from MDB cloud:
    app.post('/checkAdmins', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0)
            })
    })

    // -----------------------------------------------------
    // Post order to the MDB cloud:
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
            .then(result => {
                // console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    // Read cart products from the mongodb database: (Review.js)
    app.get('/orders', (req, res) => {
        const bearer = (req.headers.authorization);
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // console.log({ idToken });

            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    // console.log(tokenEmail, queryEmail);

                    if (tokenEmail == queryEmail) {
                        adminCollection.find({ email: queryEmail })
                            .toArray((error, results) => {
                                if (results.length === 0) {
                                    ordersCollection.find({ email: queryEmail })
                                        .toArray((err, documents) => {
                                            res.status(200).send(documents);
                                        })
                                }
                                else {
                                    ordersCollection.find({})
                                        .toArray((err, services) => {
                                            res.send(services)
                                        })
                                }
                            })
                    }
                    else {
                        res.status(401).send('Unathorised access. Please try again letter!');
                    }
                })
                .catch((error) => {
                    res.status(401).send('Unathorised access. Please try again letter!');
                });
        }
        else {
            res.status(401).send('Unathorised access. Please try again letter!');
        }
    })

    // Patch/update to mongodb database: DashboardCode
    app.patch("/serviceUpdate/:id", (req, res) => {
        ordersCollection.updateOne(
            { _id: ObjectId(req.params.id) },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                // console.log(result);
                res.send(result.modifiedCount > 0);
            })
    })



});


app.listen(port);