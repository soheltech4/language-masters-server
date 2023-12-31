const express = require("express");
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

//  middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rbfkgiq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const allClass = client.db("languageDB").collection("allclass");
    const allInstructor = client.db("languageDB").collection("allinstructor");
    const cartCollection = client.db("languageDB").collection("carts");
    const users = client.db("languageDB").collection("users");

    app.post('/users', async(req, res)=> {
      const user = req.body
      const query = {email: user.email}
      const existingUser = await users.findOne(query)
      if(existingUser){
        return res.send({message: "user Already exist"})
      }
      const result = await users.insertOne(user)
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set : {
          role : 'admin'
        }
      }
      const result = await users.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.patch('/users/instructor/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set : {
          role : 'instructor'
        }
      }
      const result = await users.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.get('/users', async(req, res)=>{
      const result = await users.find().toArray()
      res.send(result)
    })

    app.delete('/users/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)};
      const result = await users.deleteOne(query)
      res.send(result)
    })

    app.get('/allclass', async (req, res) => {
      const cursor = allClass.find();
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/allclass', async(req, res)=>{
      const Class = req.body
      const result = await allClass.insertOne(Class)
      res.send(result)
    })


    app.get('/allclass/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)};
      const result = await allClass.find(query).toArray()
      res.send(result)
    })

    app.get('/allinstructor', async (req, res) => {
      const result = await allInstructor.find().toArray()
      res.send(result)
    })

    app.get('/allinstructor/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)};
      const result = await allInstructor.find(query).toArray()
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const item = req.body
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })

    app.get('/carts', async(req, res)=>{
      const email = req.query.email 
      if(!email){
        res.send([])
      }
      const query = {email : email}
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })


    app.delete('/carts/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)};
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Language Masters is Running")
})


app.listen(port, () => {
  console.log(`Language Masters is Running on Port ${port}`)
})
