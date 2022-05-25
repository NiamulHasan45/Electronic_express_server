const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const res = require('express/lib/response');


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.pic6t.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {

    try {
        await client.connect();
        const partsCollection = client.db('electronic-express').collection('parts');
        const orderCollection = client.db('electronic-express').collection('orders');
        const reviewCollection = client.db('electronic-express').collection('reviews');
        const userCollection = client.db('electronic-express').collection('users');

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })


        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester })
            if (requesterAccount.role === 'admin') {
                const filter = { email: email }
                const updateDoc = {
                    $set: { role: 'admin' },
                }
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else{

            }

        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
          })
      

        app.get('/user', verifyJWT, async (req, res) => {
            const user = await userCollection.find({}).toArray();
            res.send(user);
        })

        app.put('/onepart/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            console.log(updatedItem)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    available: updatedItem.available
                }
            };
            const result = await partsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })




        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);

        })

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);

        })

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send({ success: true, result });
        })

        //Find a specific item
        app.get('/onepart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await partsCollection.findOne(query);
            res.send(service);
        });


        app.post('/order', async (req, res) => {
            const newService = req.body;
            const result = await orderCollection.insertOne(newService);
            res.send({ success: true, result });
        });

        //   app.get('/order', async(req, res) =>{
        //     const query ={};
        //     const cursor = orderCollection.find(query);
        //     const reviews = await cursor.toArray();
        //     res.send(reviews);

        // })

        app.get('/order', verifyJWT, async (req, res) => {
            const user = req.query.userEmail;
            const decoded = req.decoded.email;

            if (user == decoded) {
                const query = { userEmail: user }
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                return res.status(403).send({ message: "Token unauthorized" })
            }


        })


        app.put('/onepart/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            console.log(updatedItem)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    available: updatedItem.available
                }
            };
            const result = await partsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
