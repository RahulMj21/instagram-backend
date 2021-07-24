require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const posts = require("./dbModel");
const Pusher = require("pusher");

//pusher config
const pusher = new Pusher({
  appId: process.env.appId,
  key: process.env.key,
  secret: process.env.secret,
  cluster: process.env.cluster,
  useTLS: true,
});

//app config
const app = express();
const PORT = process.env.PORT || 8000;

//middlewares
app.use(express.json());
app.use(cors());

//db config
const connectionURL = process.env.CONNECTION_URL;

mongoose.connect(connectionURL, {
  useCreateIndex: true,
  useFindAndModify: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("db connected..");

  const changeStream = mongoose.connection.collection("posts").watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const postDetails = change.fullDocument;
      pusher.trigger("posts", "inserted", {
        data: postDetails,
      });
    } else {
      console.log("triggered a different operation_type", change.operationType);
    }
  });
});

//api endpoints
app.get("/", (req, res) => res.status(200).send("Hello from Rahul"));

app.post("/upload", (req, res) => {
  const body = req.body;

  posts.create(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/posts", (req, res) => {
  posts
    .find()
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(data);
      }
    });
});

// app listner
app.listen(PORT, () => {
  console.log(`your server is started at http://localhost:${PORT}`);
});
