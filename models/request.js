const mongoose = require("mongoose");
const { contractSchema } = require("./contract");

const requestSchema = new mongoose.Schema({
  title: String,
  description: String,
  approved: Boolean,
  contracts: [contractSchema],
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;

// [
//   {
//     title: "test",
//     description: "desc",
//     contracts: [
//       {
//         chainId: "80001",
//         lzChainId: "10109",
//         address: "0xtest",
//       },
//     ],
//   },
// ];
