const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//Middlewires
app.use(cors());
app.use(express.json())


const port = process.env.PORT || 5000;

app.listen(port,() => console.log(`The server is running on port ${port}`))


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.ctntq2l.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  const DB = client.db("ElectroMart").collection("ProductsCollection");
  const userCollection = client.db("ElectroMart").collection("users");
  // const cartCollection = client.db("ElectroMart").collection("orders");
  
  try {
    app.get('/',(req,res)=>{
      res.send('Welcome to Electro Mart Server')
    });

   app.get('/products',async(req,res)=>{
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    const search = req.query.search;
    const query = { productName: new RegExp(search, 'i') };
    const searchRes =await DB.find(query).toArray();
    const allProducts =await DB.find({}).skip(page*size).limit(size).toArray();
    const productsbyEmail = await DB.find({email:req.query.email}).toArray();
    const count = await DB.estimatedDocumentCount();
    res.send({allProducts,productsbyEmail,count,searchRes})
   });

  // app.get('/products', async (req, res) => {
  //   try {
  //     const page = parseInt(req.query.page);
  //     const size = parseInt(req.query.size);
  //     const search = req.query.search;
  //     const email = req.query.email;
  
  //     // Creating a regular expression pattern for case-insensitive search
  //     const query = { productName: new RegExp(search, 'i') };
  
  //     // Count total documents matching the search criteria
  //     const count = await DB.countDocuments(query);
  
  //     // Fetch products based on the search criteria and pagination
  //     const products = await DB.find(query)
  //       .skip(page * size)
  //       .limit(size)
  //       .toArray();
  
  //     // Fetch products by email (assuming 'email' is a field in the collection)
  //     const productsByEmail = await DB.find({ email }).toArray();
  
  //     res.json({
  //       products,
  //       productsByEmail,
  //       totalCount: count,
  //     });
  //   } catch (error) {
  //     console.error('Error:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // });
  

   app.get('/products/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id:new ObjectId(id)}
    const product = await DB.find(query).toArray();
    res.send(product)
   })

   app.get('/category/:category',async(req,res)=>{
    const categorialProducts = await DB.find({category:req.query.category}).toArray();
    res.send(categorialProducts);
   })


   app.get('/users',async(req,res)=>{
    const AllUsers = await userCollection.find({}).toArray();
    res.send(AllUsers)
   })
   
   
   app.post('/products',async(req,res)=>{
    const products = req.body;
    const result= await DB.insertOne(products);
    res.send(result);
   });

   app.post('/users',async(req,res)=>{
    const data = req.body;
    const result = await userCollection.insertOne(data)
    res.send(result)
   });

   app.post('/orders',async(req,res)=>{
    const ids = req.body;
    const objectIds = ids.map(id =>new ObjectId(id))
    const query = {_id :{$in : objectIds}};
    const cursor = DB.find(query);
    const productsCart = await cursor.toArray();
    res.send(productsCart);
  })
  

   app.patch('/products/:id',async(req,res)=>{
    const id = req.params.id;
    const {price,quantity}= req.body;
    const filter = {_id : new ObjectId(id)}
    const options = {upsert: false}
    if(price !== undefined){
      const updatePrice = {
        $set :{
          price
        }
      }
      const result = await DB.updateOne(filter, updatePrice, options);
    }
    
    if(quantity !== undefined){
      const updateQuantity = {
        $set:{
          quantity
        }
      }
      const result = await DB.updateOne(filter,updateQuantity,options);
    }
    
   })
   
   app.delete('/products/:id',async(req,res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await DB.deleteOne(query);
    res.send(result)
   })
  
   
  } finally {
    
  }
}
run().catch(console.dir);
