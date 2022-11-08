const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@grover-grocery.gqn8qjj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const productsCollection = client.db('grocery').collection('products')
        app.get('/homeproducts', async(req,res)=>{
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.limit(3).toArray();
            console.log(products)
            res.send(products)
        })
        app.get('/services', async(req,res)=>{
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray()
            res.send(products)
        })
        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray()
            res.send(products)
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