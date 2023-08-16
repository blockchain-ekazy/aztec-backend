const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const Moralis = require("moralis").default;

require("dotenv").config();

const app = express();
mongoose
  .connect(process.env.MONGODB_URI, {
    ssl: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

Moralis.start({
  apiKey: "epklPSqwrWAsdinNNZ7A8DirMVDhpdb85l4DEaJbPzIxm2Wj2Ag1QGx6NqFMuO9P",
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());
app.use("/api", routes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
