const express = require("express");
const ethers = require("ethers");
const router = express.Router();
const Collection = require("../models/collection");
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
    let nfts = {};

    // for (let i = 0; i < collection.contracts.length; i++) {
    //   const response = await Moralis.EvmApi.nft.getContractNFTs({
    //     address: collection.contracts[i].address,
    //     chain: collection.contracts[i].chainId,
    //   });
    //   nfts[collection.contracts[i].chainId] = response.result;
    // }

    res.send({ collection, nfts });
  } catch (err) {
    res.status(500).send(err);
  }
});

// http://localhost:3001/api/get-tokens/account/0x86fc9DbcE9e909c7AB4D5D94F07e70742E2d144A/chain/80001
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
          )
            r_.addresses = c_.contracts;
        });
      });

      res.send(response.raw.result);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

router.post("/adminlogin", async (req, res) => {
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
