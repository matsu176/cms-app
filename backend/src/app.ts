import express from "express";
import cors from "cors";
import { articlesRouter } from "./articles.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "CMS API is running" });
});

app.get("/api/hello", (req, res) => {   
  res.json({ message: "hello from express" });
});

app.use("/api/articles", articlesRouter);

app.use(errorHandler); 