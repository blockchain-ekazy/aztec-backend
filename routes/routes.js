const express = require("express");
const ethers = require("ethers");
const router = express.Router();

router.get("/sign/:sessionId/:victory", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const victory = req.params.victory;

    if (!victory || !sessionId) {
      res.status(400).send({ error: "Invalid api call" });
      return;
    }

    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-goerli.g.alchemy.com/v2/9rYRCT3uOuRu6TI-LMXNj1v57YWNZqBD"
    );
    const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
    let message1 = ethers.utils.solidityPack(
      ["uint", "bool"],
      [sessionId, victory]
    );
    message1 = ethers.utils.solidityKeccak256(["bytes"], [message1]);

    const signature1 = await signer.signMessage(
      ethers.utils.arrayify(message1)
    );

    res.send({ signature1, sessionId, victory });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
