const mongoose = require("mongoose");
const { contractSchema } = require("./contract");

const requestSchema = new mongoose.Schema({
  title: String,
  website_url: String,
  contact_email: String,
  discord: String,
  telegram: String,
  discord: String,
  other: String,
  comments: String,
  description: String,
  approved: Boolean,
  contracts: [contractSchema],
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
