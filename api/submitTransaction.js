// File: api/submitTransaction.js (Final Vercel Version)

const { Keypair, Horizon, Operation, TransactionBuilder, Asset } = require('stellar-sdk');
const { mnemonicToSeedSync } = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const axios = require('axios');

const createServer = () => new Horizon.Server("https://api.mainnet.minepi.com", {
    httpClient: axios.create({ timeout: 25000 }) // टाइमआउट 25 सेकंड
});

const createKeypairFromMnemonic = (mnemonic) => {
    try {
        return Keypair.fromRawEd25519Seed(derivePath("m/44'/314159'/0'", mnemonicToSeedSync(mnemonic).toString('hex')).key);
    } catch (e) {
        throw new Error("Invalid keyphrase. Please check it and try again.");
    }
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const params = req.body;
        const senderKeypair = createKeypairFromMnemonic(params.senderMnemonic);
        let sponsorKeypair = null;
        if (params.feeType === 'SPONSOR_PAYS' && params.sponsorMnemonic) {
            sponsorKeypair = createKeypairFromMnemonic(params.sponsorMnemonic);
        }

        const server = createServer();
        const sourceAccountKeypair = (params.feeType === 'SPONSOR_PAYS') ? sponsorKeypair : senderKeypair;
        const accountToLoad = await server.loadAccount(sourceAccountKeypair.publicKey());
        const fee = await server.fetchBaseFee();
        const tx = new TransactionBuilder(accountToLoad, { fee, networkPassphrase: "Pi Network" });

        if (params.operation === 'claim_and_transfer') {
            tx.addOperation(Operation.claimClaimableBalance({ balanceId: params.claimableId, source: senderKeypair.publicKey() }));
        }
        tx.addOperation(Operation.payment({ destination: params.receiverAddress, asset: Asset.native(), amount: params.amount.toString(), source: senderKeypair.publicKey() }));
        
        const transaction = tx.setTimeout(60).build();
        transaction.sign(senderKeypair);
        if (params.feeType === 'SPONSOR_PAYS') transaction.sign(sponsorKeypair);
        
        const result = await server.submitTransaction(transaction);
        if (result && result.hash) {
             return res.status(200).json({ success: true, response: result });
        } else {
            throw new Error("Transaction submitted but no hash was returned.");
        }
    } catch (error) {
        console.error("Error in submitTransaction:", error);
        let detailedError = "An unknown server error occurred.";
        if (error.message) detailedError = error.message;
        if (error.response?.data?.extras?.result_codes) detailedError = "Transaction Failed: " + JSON.stringify(error.response.data.extras.result_codes);
        
        return res.status(500).json({ success: false, error: detailedError });
    }
};    }
};
