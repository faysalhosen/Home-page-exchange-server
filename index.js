const express = require ('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wzxk65v.mongodb.net/?retryWrites=true&w=majority`;

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
 
    const serviceCollection = client.db('homeServices').collection('allService');
    const bookingCollection = client.db('homeServices').collection('bookings');
    
      //post services
    app.post("/services", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await serviceCollection.insertOne(user);
      console.log(result);
      res.send(result);
    });

     //services
    app.get('/services',async(req, res) => {
        const result = await serviceCollection.find().toArray();
        res.send(result)
    })
    
    //get single services by id
    app.get('/services/:id',async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await serviceCollection.findOne(query)
      res.send(result)
    })
    //update services
   app.get('/services',async(req, res) => {
    let query = {}
    if(req.query?.email){
      query = {email: req.query?.email}
    }
    const result = await serviceCollection.find(query).toArray()
    console.log(req.query.email)
      res.send(result)

   })