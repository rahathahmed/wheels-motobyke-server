const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;
const cors = require('cors')
const port = 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ge4ap.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
  try{
    await client.connect();
    console.log("Database Connected");

    const productsCollection = client.db("wheels_moto").collection("bikes");
    const orderCollection = client.db("Order").collection("bikes");
    const userCollection = client.db("Users").collection("users");
    const reviewCollection = client.db("Review").collection("feddback");

    // add product
    app.post("/addProducts", async (req, res) => {
      const result = await productsCollection.insertOne(req.body);
      res.send(result);
    });

    // add review
    app.post("/review", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
     
    });

    //add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });
    //get all products

    app.get("/allProducts", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });

    //get review data
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.send(result);
    });

    //get single products by placing order
    app.get("/singleProduct/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: ObjectId(id) };
      const service = await productsCollection.findOne(qurey);
      res.json(service);
    });

    //order post
    app.post("/confirmOrder", async (req, res) => {
      const result = await orderCollection.insertOne(req.body);
      res.send(result);
     
    });

    //get email by admin selected
    app.get("/single/:email", async (req, res) => {
      const result = await orderCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    //delete order by placing order
    app.delete("/deleted/:id", async (req, res) => {
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
     
    });

    //finding admin to add admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //put extra data to make a admin
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
     
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //put extra data to make a admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      
      const filter = { email: user.email };
     
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
  }
  finally{
    // await client.close()
  }
}

run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hi Wellcome Wheels Motobike Server ')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})