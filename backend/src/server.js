const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "hello from express" });
});

app.listen(8080, () => {
  console.log("server running on http://localhost:8080");
});