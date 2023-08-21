const express = require("express");
const ethers = require("ethers");
const router = express.Router();
const Collection = require("../models/collection");
const Request = require("../models/request");
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

      if (!(chainId == "0x5" || chainId == "0x13381" || chainId == "0x61")) {
        res.status(200).send([]);
        return;
      }

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
