
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port =process.env.PORT || 5000;
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tuadu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db("evertimeWatch");


        const productsCollection = database.collection("products");
        const reviewCollection = client.db("evertimeWatch").collection("review");
        const ordersCollection = client.db("evertimeWatch").collection("orders");
        const usersCollection =client.db("evertimeWatch").collection('users');


        console.log('connected to database');
        //get products to show ui
        app.get('/allProducts' , async(req , res) => {
            const cursor = await productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        //get single product to show data

      app.get('/singleProducts/:id' , async(req , res) => {
        const id = req.params.id;
        console.log(id);
        const query = {_id: ObjectId(id)};
        const product = await productsCollection.findOne(query);
        console.log(product);
        res.send(product);
    })


 

        //post api to insert product in database

        app.post('/addProducts' , async (req , res) => {
            res.send('post hitted')
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            // console.log('hit the post ', service);
            res.send(result)
        })

          // review
  app.post("/addReview", async (req, res) => {
    const result = await reviewCollection.insertOne(req.body);
    res.send(result);
  })

  //get review to show in ui
  app.get('/review' , async(req , res) => {
    const cursor = await reviewCollection.find({});
    const review = await cursor.toArray();
    res.send(review);
})


// insert order and

app.post("/addOrders", async (req, res) => {
  const result = await ordersCollection.insertOne(req.body);
  res.send(result);
});

 //  my order

 app.get("/myOrder/:email", async (req, res) => {
  // console.log(req.params.email);
  const result = await ordersCollection
    .find({ email: req.params.email })
    .toArray();
  res.send(result);
});

// manage  all orders

app.get("/allOrders", async (req, res) => {
  const result = await ordersCollection
    .find({})
    .toArray();
  res.send(result);
});


// status update
app.put("/statusUpdate/:id", async (req, res) => {
  const filter = { _id: ObjectId(req.params.id) };
  console.log(req.params.id);
  const result = await ordersCollection.updateOne(filter, {
    $set: {
      status: req.body.status,
    },
  });
  res.send(result);
  console.log(result);
});

// save user
app.post('/users', async (req, res) => {
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  console.log(result);
  res.json(result);
});

app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});


  // DELETE product
  app.delete('/allProducts/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await productsCollection.deleteOne(query);

    console.log('deleting user with id ', result);

    res.json(result);
})


//  //  make admin

 app.put("/makeAdmin", async (req, res) => {
  const filter = { email: req.body.email };
  const result = await usersCollection.find(filter).toArray();
  if (result) {
    const documents = await usersCollection.updateOne(filter, {
      $set: { role: "admin" },
    });
    console.log(documents);
  }
 })
// check admin or not
app.get("/checkAdmin/:email", async (req, res) => {
  const result = await usersCollection
    .find({ email: req.params.email })
    .toArray();
  console.log(result);
  res.send(result);
});

    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from evertime watch')
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})
