import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import Todo from "./models/Todo.js"

const app = express();
app.use(cors());
app.use(express.json());

await mongoose.connect("mongodb://127.0.0.1:27017/todos");
console.log("MongoDB connected");

/* Get all tasks */
app.get("/api/todos", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

/* Add new task */
app.post("/api/todos", async (req, res) => {
  const newTodo = await Todo.create(req.body);
  res.json(newTodo);
});

/* Update task */
app.patch("/api/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: 'Error during update' });
  }
});

/* Delete task */
app.delete("/api/todos/:id", async (req, res) => {
  const deleteTodo = await Todo.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on http:\\localhost:3000"));