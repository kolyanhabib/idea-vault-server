const express = require("express");

const dotenv = require("dotenv");

const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;

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

    // await client.db("admin").command({
    //   ping: 1,
    // });

    const db = client.db("ideavault");

    // COLLECTIONS
    const ideaCollection = db.collection("ideas");

    const commentsCollection = db.collection("comments");

    const userCollection = db.collection("users");










    console.log("MongoDB Connected Successfully");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("IdeaVault Server Running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
