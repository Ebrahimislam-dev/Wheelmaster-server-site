const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b67bk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('wheel_master');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');


        //post Add a products api 
        app.post('/products', async (req, res) => {
            const service = req.body;

            console.log('hit the post api', service);

            const result = await productsCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // get Api products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        //product delete Api 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result)
        })
        //Reviews store in database
        //post Add a Review api 
        app.post('/reviews', async (req, res) => {
            const review = req.body;

            console.log('hit the post api', review);

            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result)
        });
        // get Api reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //user data store in database
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        //orders data in databsse
        // Add Order api
        app.post("/order", async (req, res) => {
            console.log(req.body);
            const result = await orderCollection.insertOne(req.body);
            res.send(result);
        });

        // my order api

        app.get("/myorder/:email", async (req, res) => {
            const result = await orderCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });


        // get all orders api

        app.get("/allorder", async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // update order approval
        app.put("/allorder/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const item = await orderCollection.findOne({ _id: ObjectId(id) })
            const updatedOrder = req.body;
            const filter = { _id: item._id }
            const options = { update: true }
            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                }
            };
            const items = await orderCollection.updateOne(filter, updateDoc, options)
            res.send(items)
        });

        //  // update orders 
        // app.put("/allorder/:itemsId", async (req, res) => {
        //     const id = req.params.itemsId;
        //     const item = await productsCollection.findOne({ _id: ObjectId(id) })
        //     const updatedOrder = req.body;
        //     const filter = { title: item.title }
        //     const options = { update: true }
        //     const updateDoc = {
        //         $set: {
        //             status: updatedOrder.status
        //         }
        //     };
        //     const items = await orderCollection.updateOne(filter, updateDoc, options)
        //     res.send(items)
        // });

        //order delete Api
        app.delete('/allorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello wheel master server!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})