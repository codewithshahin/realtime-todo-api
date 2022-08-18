import express from "express";
import cors from "cors";
import dontenv from "dotenv";
dontenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { addUser } from "./utils/utils.js";
import Todo from "./models/Todo.js";

//ports
const PORT = process.env.PORT || 8080;

//express app
const app = express();

//socket.io init
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /*options*/
  cors: {
    origin: process.env.ORIGN,
  },
});

//middlewares
app.use(
  cors({
    origin: process.env.ORIGN,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//db connections
mongoose
  .connect(process.env.DB_URL)
  .then((res) => {})
  .catch((err) => {
    console.log(err.message);
  });

//realtime watch
let onlineusers = [];

const db = mongoose.connection;
db.once("connected", async () => {
  console.log("db connected!");
  const userCollection = await db.collection("users");
  const userStream = await userCollection.watch();
  userStream.on("change", (change) => {
    // console.log(change);
    if (change.operationType === "update") {
      const updateFileds = change.updateDescription.updatedFields;
    } else {
    }
    io.emit("users", change);
    // onlineusers.forEach((socket) => {
    //   socket.emit("users", change);
    // });
  });

  //todo change
  const todoCollection = await db.collection("todos");
  const todoStream = await todoCollection.watch();
  todoStream.on("change", (change) => {
    if (change.operationType === "update") {
      const {
        documentKey: { _id },
        updateDescription: { updatedFields },
      } = change;
      const doc = {
        _id,
        updatedFields,
      };
      io.emit("todoupdated", doc);
    } else if (change.operationType === "insert") {
      const doc = change.fullDocument;
      io.emit("newtodo", doc);
    } else if (change.operationType === "delete") {
      io.emit("totodeleted", change.documentKey._id);
    }
  });
});

//socket io
io.on("connection", (socket) => {
  onlineusers.push(socket);
});

//apis
app.post("/users/new", (req, res) => {
  const user = req.body;
  User.create(user, (err, doc) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(201).json(doc);
    }
  });
});

//todo apis

//ADD
app.post("/todos/new", async (req, res) => {
  try {
    await Todo.create(req.body);
    res.status(201).json("Todo Added");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
app.put("/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    res.status(200).json("Todo updated successfully.");
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
app.delete("/todos/:id", async (req, res) => {
  try {
    await Todo.findOneAndDelete(req.params.id);
    res.status(200).json("Deleted Successfully..");
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/users/:id", async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    $set: req.body,
  });
  res.status(200).json("updated success");
});

app.get("/", (req, res) => {
  res.status(200).json("Backed is running...");
});

//app start
httpServer.listen(PORT, () => {
  console.log(`Server is running on PORT: http://localhost:${PORT}`);
});
