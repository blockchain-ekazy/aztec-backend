const express = require("express");
const ethers = require("ethers");
const router = express.Router();
const Collection = require("../models/collection");
const Request = require("../models/request");
const { default: axios } = require("axios");
const Moralis = require("moralis").default;

router.post("/collection", async (req, res) => {
  let auth = req.header("Authorization");
  if (!verifyAdmin("Update Collection " + req.body.id, auth)) {
    res.status(401).send("Unauthorized Wallet");
    return;
  }

  try {
    if (req.body.id) {
      const updatedcollection = await Collection.findByIdAndUpdate(
        req.body.id,
        req.body
      );
      if (updatedcollection) {
        res.json(updatedcollection);
        return;
      } else {
        res.status(404).json({ error: "Collection not found" });
        return;
      }
    } else {
      const collection = new Collection(req.body);
      await collection.save();
      res.send(collection);
      return;
    }
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

router.post("/delete-collection", async (req, res) => {
  let auth = req.header("Authorization");
  if (!verifyAdmin("Delete Collection " + req.body.id, auth)) {
    res.status(401).send("Unauthorized Wallet");
    return;
  }

  try {
    if (req.body.id) {
      const deletedcollection = await Collection.findByIdAndDelete(req.body.id);
      if (deletedcollection) {
        res.json(deletedcollection);
        return;
      } else {
        res.status(404).json({ error: "Collection not found" });
        return;
      }
    }
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

router.get("/collections", async (req, res) => {
  try {
    const collection = await Collection.find();
    res.send(collection);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/collection/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      res.status(400).send({ error: "Invalid Id" });
      return;
    }

    let collection = await Collection.findById(id);

    res.send({ collection });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/request", async (req, res) => {
  try {
    if (req.body.id) {
      const updatedrequest = await Request.findByIdAndUpdate(
        req.body.id,
        req.body
      );
      if (updatedrequest) {
        res.json(updatedrequest);
        return;
      } else {
        res.status(404).json({ error: "Collection not found" });
        return;
      }
    } else {
      const request = new Request(req.body);
      await request.save();
      res.send(request);
      return;
    }
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

router.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find();
    res.send(requests);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/request/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      res.status(400).send({ error: "Invalid Id" });
      return;
    }

    let request = await Request.findById(id);

    res.send({ request });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/delete-request", async (req, res) => {
  let auth = req.header("Authorization");
  if (!verifyAdmin("Delete Request " + req.body._id, auth)) {
    res.status(401).send("Unauthorized Wallet");
    return;
  }

  try {
    if (req.body._id) {
      const deletedrequest = await Request.findByIdAndDelete(req.body._id);
      if (deletedrequest) {
        res.json(deletedrequest);
        return;
      } else {
        res.status(404).json({ error: "Request not found" });
        return;
      }
    }
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

router.post("/approve-request", async (req, res) => {
  let auth = req.header("Authorization");
  if (!verifyAdmin("Approve Request " + req.body._id, auth)) {
    res.status(401).send("Unauthorized Wallet");
    return;
  }

  try {
    if (req.body._id) {
      const approverequest = await Request.findByIdAndUpdate(
        req.body._id,
        req.body
      );
      if (approverequest) {
        const collection = new Collection(req.body);
        await collection.save();
        res.send(collection);
        return;
      } else {
        res.status(404).json({ error: "Collection not found" });
        return;
      }
    } else {
      res.status(404).send("Request not found!");
      return;
    }
  } catch (err) {
    res.status(400).send(err);
    return;
  }
});

// // http://localhost:3001/api/get-tokens/account/0x86fc9DbcE9e909c7AB4D5D94F07e70742E2d144A/chain/80001
// router.get(
//   "/get-tokens/account/:walletAddress/chain/:chainId",
//   async (req, res) => {
//     try {
//       const collections = await Collection.find();
//       if (collections.length == 0) {
//         return res.status(200).send([]);
//       }

//       const walletAddress = req.params.walletAddress;
//       const chainId = req.params.chainId;

//       let addresses = [];
//       collections.forEach((c_) => {
//         c_.contracts.forEach((c__) => {
//           if (c__.chainId == chainId) {
//             let obj = {};
//             obj[c__.address] = [];
//             addresses.push(obj);
//           }
//         });
//       });

//       if (addresses.length == 0) {
//         return res.status(200).send([]);
//       }

//       const options = {
//         method: "POST",
//         url: `https://rpc.ankr.com/multichain/${process.env.ANKR_API}/?ankr_getNFTsByOwner=`,
//         headers: {
//           accept: "application/json",
//           "content-type": "application/json",
//         },
//         data: {
//           jsonrpc: "2.0",
//           method: "ankr_getNFTsByOwner",
//           params: {
//             blockchain: [Ankr_Chain_IdToName[chainId]],
//             filter: ["0x01d2fc2baD2F08B46381169007c8A2a02AE0C19a", []],
//             // filter: addresses,
//             walletAddress: walletAddress,
//           },
//           id: 1,
//         },
//       };

//       await axios
//         .request(options)
//         .then(async function (response) {
//           console.log(response.data.result);
//           if (!response.data.result) {
//             return res.status(200).send([]);
//           }

//           response.data.result.assets.forEach((r_) => {
//             collections.forEach((c_) => {
//               if (
//                 c_.contracts.find((c__) => {
//                   return (
//                     c__.address.toLowerCase() ==
//                     r_.contractAddress.toLowerCase()
//                   );
//                 })
//               )
//                 r_.addresses = c_.contracts;
//             });
//           });

//           let filteredTokens = [];
//           for (let i = 0; i < response.data.result.assets.length; i++) {
//             let r_ = response.data.result.assets[i];
//             let provider = new ethers.providers.JsonRpcProvider(
//               `https://rpc.ankr.com/${Ankr_Chain_IdToName[chainId]}`
//             );

//             const ct = new ethers.Contract(
//               r_.contractAddress,
//               ownerOf_ABI,
//               provider
//             );

//             try {
//               let o_ = await ct.ownerOf(r_.tokenId);
//               if (o_.toLowerCase() == walletAddress.toLowerCase()) {
//                 filteredTokens.push(response.data.result.assets[i]);
//               }
//             } catch (e) {
//               // console.log(e);
//             }
//           }

//           return res.status(200).send(filteredTokens);
//         })
//         .catch(function (error) {
//           console.error(error);
//           return res.status(400).send(error);
//         });
//     } catch (err) {
//       console.log(err);
//       res.status(500).send(err);
//     }
//   }
// );

router.post("/adminlogin", async (req, res) => {
  const { reCAPTCHA_TOKEN, Secret_Key } = req.body;
  try {
    let response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${Secret_Key}&response=${reCAPTCHA_TOKEN}`
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error verifying token",
    });
  }

  try {
    const message = req.body.message;
    const signature = req.body.signature;

    if (verifyAdmin(message, signature)) {
      res.status(200).send({ message, signature });
      return;
    }
    res.status(401).send({ error: "Invalid Login" });
    return;
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;

function verifyAdmin(m, s) {
  return (
    String(process.env.ADMIN_WALLET).toLowerCase() ==
    String(ethers.utils.verifyMessage(m, s)).toLowerCase()
  );
}

const Ankr_Chain_IdToName = {
  // "0x1": "eth",
  // "0x89": "polygon",
  // "0x38": "bsc",
  // "0xa86a": "avalanche",
  // "0xfa": "fantom",
  "0x5": "eth_goerli",
  "0x13881": "polygon_mumbai",
  "0xa869": "avalanche_fuji",
  // "0x61": "bsc_testnet_chapel",
  // "0xfa2": "fantom_testnet",
  // "0x1a4": "optimism_testnet",
};

const ownerOf_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

// MORALIS
// http://localhost:3001/api/get-tokens/account/0x86fc9DbcE9e909c7AB4D5D94F07e70742E2d144A/chain/0x13881
router.get(
  "/get-tokens/account/:walletAddress/chain/:chainId",
  async (req, res) => {
    try {
      const collections = await Collection.find();
      if (collections.length == 0) {
        res.status(200).send([]);
        return;
      }

      const walletAddress = req.params.walletAddress;
      const chainId = req.params.chainId;

      let addresses = [];
      collections.forEach((c_) => {
        c_.contracts.forEach((c__) => {
          if (c__.chainId == chainId) addresses.push(c__.address);
        });
      });

      if (addresses.length == 0) {
        res.status(200).send([]);
        return;
      }

      if (chainId == "0x5" || chainId == "0x13881" || chainId == "0x61") {
        let response = await Moralis.EvmApi.nft
          .getWalletNFTs({
            chain: chainId,
            format: "decimal",
            normalizeMetadata: false,
            tokenAddresses: addresses,
            mediaItems: false,
            address: walletAddress,
          })
          .catch((e) => console.log("Morallis error", e));

        if (response.raw.result.length == 0) {
          res.status(200).send([]);
          return;
        }

        response.raw.result.forEach((r_) => {
          collections.forEach((c_) => {
            if (
              c_.contracts.find((c__) => {
                return (
                  c__.address.toLowerCase() == r_.token_address.toLowerCase()
                );
              })
            ) {
              r_.addresses = c_.contracts;
              r_.version = c_.version;
            }
          });

          let m = JSON.parse(r_.metadata);

          r_["imageUrl"] =
            m && m.image
              ? m.image
              : "https://testnets.opensea.io/static/images/placeholder.png";
          r_["name"] = m && m.name ? m.name : "#" + r_.token_id;
          r_["contractAddress"] = r_.token_address;
          r_["tokenId"] = r_.token_id;
        });

        res.send(response.raw.result);
      } else if (chainId == "0xa869") {
        const options = {
          method: "POST",
          url: `https://rpc.ankr.com/multichain/${process.env.ANKR_API}/?ankr_getNFTsByOwner=`,
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          data: {
            jsonrpc: "2.0",
            method: "ankr_getNFTsByOwner",
            params: {
              blockchain: [Ankr_Chain_IdToName[chainId]],
              filter: ["0x01d2fc2baD2F08B46381169007c8A2a02AE0C19a", []],
              filter: addresses,
              walletAddress: walletAddress,
            },
            id: 1,
          },
        };

        await axios.request(options).then(async function (response) {
          if (!response.data.result) {
            return res.status(200).send([]);
          }

          response.data.result.assets.forEach((r_) => {
            collections.forEach((c_) => {
              if (
                c_.contracts.find((c__) => {
                  return (
                    c__.address.toLowerCase() ==
                    r_.contractAddress.toLowerCase()
                  );
                })
              )
                r_.addresses = c_.contracts;
              r_.version = c_.version;
            });
          });

          let filteredTokens = [];
          for (let i = 0; i < response.data.result.assets.length; i++) {
            let r_ = response.data.result.assets[i];
            let provider = new ethers.providers.JsonRpcProvider(
              `https://rpc.ankr.com/${Ankr_Chain_IdToName[chainId]}`
            );

            const ct = new ethers.Contract(
              r_.contractAddress,
              ownerOf_ABI,
              provider
            );

            try {
              let o_ = await ct.ownerOf(r_.tokenId);
              if (o_.toLowerCase() == walletAddress.toLowerCase()) {
                filteredTokens.push(response.data.result.assets[i]);
              }
            } catch (e) {
              // console.log(e);
            }
          }

          return res.status(200).send(filteredTokens);
        });
      } else if (chainId == "0x507") {
        const response = await axios.get(
          `https://api.covalenthq.com/v1/moonbeam-moonbase-alpha/address/${walletAddress}/balances_nft/?with-uncached=true`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            auth: {
              username: "cqt_rQjVRwTJc737H8xtXYmG4mQywXJw",
            },
          }
        );

        let items = response.data.data.items;
        let nfts = [];
        items.forEach((i_) => {
          if (
            addresses
              .map((a_) => a_.toLowerCase())
              .includes(i_.contract_address.toLowerCase())
          ) {
            let items_ = i_.nft_data;

            items_.forEach((n_) => {
              n_["imageUrl"] = n_.external_data.image;
              n_["name"] = n_.external_data.name;
              n_["contractAddress"] = i_.contract_address;
              n_["tokenId"] = n_.token_id;

              collections.forEach((c_) => {
                if (
                  c_.contracts.find((c__) => {
                    return (
                      c__.address.toLowerCase() ==
                      i_.contract_address.toLowerCase()
                    );
                  })
                ) {
                  n_.addresses = c_.contracts;
                  n_.version = c_.version;
                }
              });
            });

            nfts = nfts.concat(i_.nft_data);
          }
        });

        res.send(nfts);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

router.get(
  "/signtraverse/:tokenAddress/:srcChain/:dstChain",
  async (req, res) => {
    try {
      const tokenAddress = req.params.tokenAddress;
      const srcChain = req.params.srcChain;
      const dstChain = req.params.dstChain;

      if (!(tokenAddress && srcChain && dstChain)) {
        res.status(400).send({ error: "Invalid api call" });
        return;
      }

      let collection = await Collection.find({
        "contracts.address": tokenAddress.toLowerCase(),
      });

      if (!collection.length) {
        res.status(400).send({ error: "Collection not found" });
        return;
      }

      const dstAddress = collection[0].contracts.filter((c_) => {
        return c_.chainId == dstChain ? c_.address : "";
      })[0].address;

      const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-goerli.g.alchemy.com/v2/9rYRCT3uOuRu6TI-LMXNj1v57YWNZqBD"
      );
      const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
      let message1 = ethers.utils.solidityPack(
        ["address", "address"],
        [tokenAddress, dstAddress]
      );
      message1 = ethers.utils.solidityKeccak256(["bytes"], [message1]);

      const signature1 = await signer.signMessage(
        ethers.utils.arrayify(message1)
      );

      res.send({ signature1, tokenAddress, dstAddress });
    } catch (err) {
      res.status(500).send(err);
    }
  }
);
