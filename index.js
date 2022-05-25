const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.pic6t.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        await client.connect();
        const partsCollection = client.db('electronic-express').collection('parts');
        const orderCollection = client.db('electronic-express').collection('orders');
        const reviewCollection = client.db('electronic-express').collection('reviews');
      

        app.get('/parts', async(req, res) =>{
            const query ={};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);

        })

        app.get('/reviews', async(req, res) =>{
            const query ={};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);

        })

        //Find a specific item
        app.get('/onepart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const service = await partsCollection.findOne(query);
            res.send(service);
          });


          app.post('/order', async (req, res) => {
            const newService = req.body;
            const result = await orderCollection.insertOne(newService);
            res.send({success: true, result});
          });

          app.get('/order', async(req, res) =>{
            const query ={};
            const cursor = orderCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);

        })

        //   app.get('/order', async(req, res) =>{
        //     const user = req.query.userEmail;
        //     console.log(user);
        //     const query = {userEmail: user}
        //     const cursor = orderCollection.find(query);
        //     const orders = await cursor.toArray();
        //     res.send(orders);

        // })


          app.put('/onepart/:id', async(req, res) =>{
            const id = req.params.id;
            const updatedItem = req.body;
            console.log(updatedItem)
            const filter = {_id: ObjectId(id)};
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
