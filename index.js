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

    /* =========================================
       USERS
    ========================================= */

    // SAVE USER
    app.post("/users", async (req, res) => {
      const user = req.body;

      const existingUser = await userCollection.findOne({
        email: user.email,
      });

      if (existingUser) {
        return res.send({
          message: "User already exists",
        });
      }

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    // GET USER
    app.get("/users/:email", async (req, res) => {
      const { email } = req.params;

      const result = await userCollection.findOne({
        email,
      });

      res.send(result);
    });

    // UPDATE PROFILE
    app.patch("/users/:email", async (req, res) => {
      try {
        const { email } = req.params;

        const { name, image } = req.body;

        const filter = {
          email,
        };

        const updatedDoc = {
          $set: {},
        };

        if (name) {
          updatedDoc.$set.name = name;
        }

        if (image) {
          updatedDoc.$set.image = image;
        }

        const result = await userCollection.updateOne(filter, updatedDoc);

        // UPDATE IDEA AUTHOR INFO
        await ideaCollection.updateMany(
          {
            userEmail: email,
          },
          {
            $set: {
              author: name,

              profile: image,
            },
          },
        );

        // UPDATE COMMENT USER INFO
        await commentsCollection.updateMany(
          {
            userEmail: email,
          },
          {
            $set: {
              userName: name,

              userProfile: image,
            },
          },
        );

        res.send(result);
      } catch (error) {
        res.status(500).send({
          error: "Failed to update profile",
        });
      }
    });

    /* =========================================
       GET ALL IDEAS
    ========================================= */

    app.get("/ideas", async (req, res) => {
      const search = req.query.search || "";

      const category = req.query.category || "";

      let query = {};

      // SEARCH
      if (search) {
        query.title = {
          $regex: search,

          $options: "i",
        };
      }

      // FILTER
      if (category && category !== "All") {
        query.category = category;
      }

      const result = await ideaCollection
        .find(query)
        .sort({
          _id: -1,
        })
        .toArray();

      res.send(result);
    });

    /* =========================================
       FEATURED IDEAS
    ========================================= */

    app.get("/featured", async (req, res) => {
      const result = await ideaCollection
        .aggregate([
          {
            $sample: {
              size: 6,
            },
          },
        ])
        .toArray();

      res.send(result);
    });

    /* =========================================
       SINGLE IDEA
    ========================================= */

    app.get("/ideas/:ideaID", async (req, res) => {
      const { ideaID } = req.params;

      const query = {
        _id: new ObjectId(ideaID),
      };

      const result = await ideaCollection.findOne(query);

      res.send(result);
    });



      const query = {
        _id: new ObjectId(id),
      };

      const updatedDoc = {
        $set: {
          title: updatedData.title,

          shortDescription: updatedData.shortDescription,

          detailedDescription: updatedData.detailedDescription,

          category: updatedData.category,

          tags: updatedData.tags,

          imageURL: updatedData.imageURL,

          estimatedBudget: updatedData.estimatedBudget,

          targetAudience: updatedData.targetAudience,

          problemStatement: updatedData.problemStatement,

          proposedSolution: updatedData.proposedSolution,
        },
      };

      const result = await ideaCollection.updateOne(query, updatedDoc);

      res.send(result);
    });

    /* =========================================
       DELETE IDEA
    ========================================= */

    app.delete("/ideas/:id", async (req, res) => {
      const { id } = req.params;

      const userEmail = req.query.email;

      const existingIdea = await ideaCollection.findOne({
        _id: new ObjectId(id),
      });

      if (existingIdea.userEmail !== userEmail) {
        return res.status(403).send({
          message: "Unauthorized access",
        });
      }

      const query = {
        _id: new ObjectId(id),
      };

      const result = await ideaCollection.deleteOne(query);

      res.send(result);
    });





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
