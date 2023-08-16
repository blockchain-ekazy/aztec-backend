const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  chainId: String,
  lzChainId: String,
  address: String,
});

const Contract = mongoose.model("Contract", contractSchema);

module.exports = { Contract, contractSchema };
