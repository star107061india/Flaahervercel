// File: api/submitTransaction.js (अंतिम Vercel संस्करण)

const { Keypair, Horizon, Operation, TransactionBuilder, Asset } = require('stellar-sdk');
const { mnemonicToSeedSync } = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const axios = require('axios');

const createKeypairFromMnemonic = (mnemonic) => {
    try {
        const seed = mnemonicToSeedSync(mnemonic);
        const derivedSeed = derivePath("m/44'/314159'/0'", seed.toString('hex'));
        return Keypair.fromRawEd25519Seed(derivedSeed.key);
    } catch (e) {
        throw new Error("Invalid keyphrase format. Please check for typos.");
    }
};

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // हर रिक्वेस्ट के लिए एक नया सर्वर इंस्टेंस बनाएँ
        const server = new Horizon.Server("https://api.mainnet.minepi.com", {
            httpClient: axios.create({ timeout: 25000 })
        });

        const params = req.body;
        const senderKeypair = createKeypairFromMnemonic(params.senderMnemonic);
        let sponsorKeypair = null;
        if (params.feeType === 'SPONSOR_PAYS' && params.sponsorMnemonic) {
            sponsorKeypair = createKeypairFromMnemonic(params.sponsorMnemonic);
        }

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
        console.error("FATAL ERROR in submitTransaction:", error.message);
        let detailedError = "A server error occurred during the transaction.";
        if (error.response?.data?.extras?.result_codes) {
            detailedError = "Transaction Failed: " + JSON.stringify(error.response.data.extras.result_codes);
        } else if (error.message.toLowerCase().includes('timeout')) {
            detailedError = "Connection to Pi network timed out. Please try again.";
        }
        
        // हमेशा एक सही JSON एरर भेजें
        return res.status(500).json({ success: false, error: detailedError });
    }
};
