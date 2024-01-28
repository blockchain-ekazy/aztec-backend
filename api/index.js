const express = require("express");
const cors = require("cors");
const routes = require("../routes/routes");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
