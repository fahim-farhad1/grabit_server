const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "*", 
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  allowedHeaders: "Authorization, Content-Type"

}));

app.use(express.json());

const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const { MongoClient, ServerApiVersion, ObjectId, UUID } = require("mongodb");
const uri = `mongodb+srv://${username}:${password}@cluster0.v73j2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    //collections
    const productsCollections = client.db("Grabit").collection("products");
    const categoriesCollections = client.db("Grabit").collection("categories");
    const teamMembersCollections = client.db("Grabit").collection("TeamMember");
    const usersCollections = client.db("Grabit").collection("userCollections");
    const cartsCollections = client.db("Grabit").collection("Carts");
    const wishlistCollections = client.db("Grabit").collection("Wishlist");

   

    // get all products
    app.get("/products", async (req, res) => {
      const result = await productsCollections.find().toArray();
      res.send(result);
    });

    //get single products with query by id
    app.get("/product", async (req, res) => {
      const id = req.query._id;

      // Validate the ID
      if (!id || !ObjectId.isValid(id)) {
        console.log(id, "id");
        return res.status(400).json({ error: "Invalid product ID" });
      }

      try {
        const query = { _id: new ObjectId(id) };
        const result = await productsCollections.findOne(query);
        res.send(result);
      } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    //get single products
    app.get("/products/:category/:slug/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id, "id");
      const query = { _id: new ObjectId(id) };
      const result = await productsCollections.findOne(query);
      res.send(result);
    });
    //get  products by category
    app.get("/products/:category/", async (req, res) => {
      const categories = req.params.category;
      const query = { category: categories };
      const result = await productsCollections.find(query).toArray();
      res.send(result);
    });

    // get all category
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollections.find().toArray();
      res.send(result);
    });

    

    //get seasonal single products
    app.get("/seasonal/:category/:slug/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id, "id");
      const query = { _id: new ObjectId(id) };
      const result = await productsCollections.findOne(query);
      res.send(result);
    });

    //get seasonal single products
    app.get("/seasonal/:category/:slug/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id, "id");
      const query = { _id: new ObjectId(id) };
      const result = await productsCollections.findOne(query);
      res.send(result);
    });

    //post carts data
    app.post("/carts", async (req, res) => {
      const cartInfo = req.body;
      const email = cartInfo.userEmail;
      const productId = cartInfo.productId;
      const query = { userEmail: email };
      const existingEmail = await cartsCollections.findOne(query);
      if (existingEmail) {
        const update = { $addToSet: { productId: productId } };
        const result = await cartsCollections.updateOne(query, update);
        res.send(result);
      } else {
        const newCart = { userEmail: email, productId: [productId] };
        const result = await cartsCollections.insertOne(newCart);
        res.send(result);
      }
    });

    //get cart data
    app.get("/carts", async (req, res) => {
      const email = req.query.userEmail;
      console.log("queryEmail:--", email);
      const query = { userEmail: email };
      const result = await cartsCollections.findOne(query);
      res.send(result);
    });
    // update cart data
    app.patch("/cart", async (req, res) => {
      const { userEmail, productId } = req.body;
      const query = { userEmail: userEmail };
      const update = { $pull: { productId: productId } };
      const result = await cartsCollections.updateOne(query, update);
      res.send(result);
    });

    // post wish list cart
    app.post("/wishlist", async (req, res) => {
      const { userEmail, productId } = req.body;
      const query = { userEmail: userEmail };

      // Ensure productId is always an array
      const productsArray = Array.isArray(productId) ? productId : [productId];

      const existingWishlist = await wishlistCollections.findOne(query);

      if (existingWishlist) {
        // 🔥 Prevent nesting by using $each only when productId is an array
        const update = {
          $addToSet: { productId: { $each: productsArray } },
        };
        const result = await wishlistCollections.updateOne(query, update);
        res.send(result);
      } else {
        // 🔥 Store productId as a flat array instead of an array inside another array
        const newWishlist = { userEmail: userEmail, productId: productsArray };
        const result = await wishlistCollections.insertOne(newWishlist);
        res.send(result);
      }
    });

    //get wishlist data
    app.get("/wishlist", async (req, res) => {
      const email = req.query.userEmail;
      const query = { userEmail: email };
      const result = await wishlistCollections.findOne(query);
      res.send(result);
    });
    app.patch("/wishlist", async (req, res) => {
      console.log("wishlistInfo", req.body);
      const { userEmail, productId } = req.body;
      const query = { userEmail: userEmail };
      const update = { $pull: { productId: productId } };
      const result = await wishlistCollections.updateOne(query, update);
      res.send(result);
    });

    // get all teamMembers
    app.get("/team-members", async (req, res) => {
      const result = await teamMembersCollections.find().toArray();
      res.send(result);
    });

    // users
    app.post("/users", async (req, res) => {
      const users = req.body;
      const email = users.email;
      const query = { email: email };
      const existingUser = await usersCollections.findOne(query);
      if (existingUser) {
        return res.status(400).json({ message: "user already exist" });
      } else {
        const result = await usersCollections.insertOne(users);
        console.log(users);
        res.send(result);
      }
    });

    // get users
    app.get("/users", async (req, res) => {
      const result = await usersCollections.find().toArray();
      res.send(result);
    });

    // get users by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await usersCollections.findOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } catch (error) {
    console.error(error);
  } finally {
    // Optional: await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
