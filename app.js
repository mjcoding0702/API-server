import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Changed to process.env for CommonJS
  ssl: {
    rejectUnauthorized: false, // Changed to false as 'require' is a reserved keyword in ESM
  },
});

async function getPostgresVersion() {
  const client = await pool.connect();
  try {
    const response = await client.query("SELECT version()");
    console.log(response.rows[0]);
  } finally {
    client.release();
  }
}

getPostgresVersion();

//Endpoint for user to delete a specific post
app.delete("/posts/:id", async (req, res) => {
  const id = req.params.id;

  const client = await pool.connect();

  try {
    await client.query("DELETE FROM posts WHERE id = $1", [id]);

    res.json({
      status: "success",
      message: "Post deleted successfully",
      sigmaschool: "testtest",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

//Endpoint for user to get all posts
app.get("/posts", async (req, res) => {
  //Connect to database
  const client = await pool.connect();

  //Logic to perform in database
  try {
    // SQL query to get all posts
    const query = "SELECT * FROM posts";

    // Run the query in database
    const result = await client.query(query);

    // Send the result to client/user (front-end)
    res.json(result.rows);
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("An error occurred");
  } finally {
    //Release the client connection
    client.release();
  }
});

//Endpoint for user to create a new post
app.post("/posts", async (req, res) => {
  const client = await pool.connect();
  try {
    const data = {
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      created_at: new Date().toISOString(),
    };

    const params = [data.title, data.content, data.author, data.created_at];

    const result = await client.query(query, params);

    data.id = result.rows[0].id; //assign the newly inserted id to the data object

    console.log(result.rows[0]);
    console.log(`Post created successfully with id ${data.id}`);
    res.json({
      status: "success",
      data: data,
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

//Endpoint to update a specific post
app.put("/posts/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const client = await pool.connect();

  try {
    const updateQuery =
      "UPDATE posts SET title = $1, content= $2, author = $3 WHERE id = $4;";
    const queryData = [
      updatedData.title,
      updatedData.content,
      updatedData.author,
      id,
    ];

    await client.query(updateQuery, queryData);

    res.json({
      status: "successssssssssssss",
      message: "Post updated sussfefef",
    });
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use((req, res) => {
  res.send("Page not found");
});

app.listen(3000, () => {
  console.log("App is listening on port 3000");
});
