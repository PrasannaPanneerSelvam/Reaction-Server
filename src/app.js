import express from "express";
import mongoose from "mongoose";

import video from "./Routes/video";
import reactions from "./Routes/reactions";

import errorHandler from "./Middleware/errorHandler";

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/reaction-server", {
  //   useUnifiedTopology: true,
  //   useNewUrlParser: true,
  //   useCreateIndex: true,
});

// Middleware to parse JSON in request body
app.use(express.json());

app.use("/video", video);

app.use("/react", reactions);

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
