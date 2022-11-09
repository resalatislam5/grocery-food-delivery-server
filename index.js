const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@grover-grocery.gqn8qjj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyToken (req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({massage: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_TOKEN,function(err, decoded){
        if(err){
            res.status(401).send({massage: 'unauthorized access'})
        }
        req.decoded = decoded;
    })
    next()
}
async function run(){
    try{
        const productsCollection = client.db('grocery').collection('products');
        const reviewsCollection = client.db('grocery').collection('reviews')
        const addServicesCollection = client.db('grocery').collection('addservices')
        app.post('/jwt',(req,res)=>{
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user,process.env.JWT_TOKEN,{ expiresIn: '1d' })
            res.send({token})
        })
        app.get('/homeproducts', async(req,res)=>{
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.limit(3).toArray();
            res.send(products)
        })
        app.get('/services', async(req,res)=>{
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray()
            res.send(products)
        })
        app.get('/service/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray()
            res.send(products)
        })
        app.put('/reviewupdate/:id', async(req,res)=>{
            const id = req.params.id;
            const filter  = {_id : ObjectId(id)}
            const reviewed = req.body.update;
            const options = { upsert: true };
            const updatedReview = {
                $set: {
                    review: reviewed
                  },
            }
            const result = await reviewsCollection.updateOne(filter, updatedReview, options);
            res.send(result)
        })
        app.get('/reviews/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {reviewId : id}
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray()
            res.send(reviews)
        })
        app.get('/myreviews',verifyToken, async(req,res)=>{
            const decoded = req.decoded;
            if(decoded?.email !== req?.query?.email){
                res.status(403).send({massage : 'unauthorize access'})
            }
            const email = req.query.email;
            const query = {email : email}
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        app.delete('/reviewdelete/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await reviewsCollection.deleteOne(query);
            res.send(result)
        })
        app.post('/reviews', async(req,res)=>{
            const review = req.body;
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })
        app.get('/addservices',verifyToken, async(req,res)=>{
            const decoded = req.decoded;
            if(decoded?.email !== req?.query?.email){
                res.status(403).send({massage : 'unauthorize access'})
            }
            const email = req.query.email
            const query = {email : email}
            const cursor = addServicesCollection.find(query);
            const addServices = await cursor.toArray()
            res.send(addServices)
        })
        app.post('/addservices', async(req,res)=>{
            const review = req.body;
            const result = await addServicesCollection.insertOne(review);
            console.log(result)
            res.send(result)
        })
    }
    finally{

    }
}
run().catch(console.dir)
app.get('/',(req,res)=>{
    res.send('Grocery Server Running....')
})

app.listen(port,()=>{
    console.log(`Grocery Server Running ${port}`)
})