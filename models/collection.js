const mongoose = require("mongoose");
const { contractSchema } = require("./contract");

const collectionSchema = new mongoose.Schema({
  title: String,
  description: String,
  contracts: [contractSchema],
  version: Number,
});

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;

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
