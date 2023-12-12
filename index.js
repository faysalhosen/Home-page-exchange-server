const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

//middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
   'https://home-page-exchange-c76d3.web.app/',
   'https://home-page-exchange.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

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

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  console.log(token)
  if(!token){
    return res.status(401).send({message: 'not authorized'});
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if(err){
      return res.status(401).send({message: 'unauthorized'});
    }
    console.log(decoded);
    req.user = decoded.user
    next();
  })
}
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
    app.get('/services', async (req, res) => {
      const result = await serviceCollection.find().toArray();
      res.send(result)
    })

    //get single services by id
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await serviceCollection.findOne(query)
      res.send(result)
    })

    //update services
    app.get('/services', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = { email: req.query?.email }
      }
      const result = await serviceCollection.find(query).toArray()
      console.log(req.query.email)
      res.send(result)

    })

    app.get('/purchase/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);
    });



    //purchase
    app.get('/purchase', verifyToken, async (req, res) => {
     console.log(req.query.email,req.user)
      if(req.query.email !== req.user){
    
        return res.status(403).send({message: 'forbidden Access'})
      }
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });



    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: true, sameSite: 'none'
        })
        .send({ success: true });
    });

    // purchase
    app.post('/purchase', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking)
      res.send(result)
    })

    app.delete('/purchase/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })


    app.put('/purchase/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedServices = req.body;
      const services = {
        $set: {
          serviceName: updatedServices.serviceName,
          email: updatedServices.email,
          date: updatedServices.date,
          price: updatedServices.price,
          serviceArea: updatedServices.serviceArea,
          photo: updatedServices.photo
        }
      }
      const result = await bookingCollection.updateOne(filter, services, options)
      res.send(result);
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
  res.send('Home Service is running')
})

app.listen(port, () => {
  console.log(`Home Service Exchange  is running on port ${port}`);
})