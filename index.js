const express = require("express");
const BigNumber = require("bignumber.js");
require('dotenv').config();

const app = express();

const Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const testPrivateKey = "774b0b51d0b56023ad4d6698c35da8fdfc609fdba0df20a03660d7e484641120";

const provider = "https://api.avax-test.network/ext/bc/C/rpc";

const localKeyProvider = new HDWalletProvider({
    privateKeys: [testPrivateKey],
    providerOrUrl: provider,
});
const web3 = new Web3(localKeyProvider);

let currencyABI = require("./CurrencyConvert.json");
let contractAddress = "0x84148838aC55268f50364E14AbC4A8bDfa88657b";
let currencyContract = new web3.eth.Contract(currencyABI, contractAddress);

app.use(express.json());

app.get('/price', async (req, res) => {
    try {
        let price = await currencyContract.methods.getCurrentPrice().call();
        res.send(parseFloat(new BigNumber(price).div(100000000)).toFixed(2).toString());
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

app.post('/price', async (req, res) => {
    let price;
    try {
        if (req.query.amount < 0 || req.query.amount === undefined) {
            res.send("amount is not valid");
            return;
        }
        price = await currencyContract.methods.convertCurrency(req.query.amount).call();
        res.send(parseFloat(new BigNumber(price).div(1000000000000000000)).toFixed(2).toString());
    } catch (error) {
        res.send(error);
    }
});

const PORT = 8080;

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});