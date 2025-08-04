// File: api/getClaimableBalances.js (अंतिम Vercel संस्करण)

const { Keypair, Horizon } = require('stellar-sdk');
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

        const { mnemonic } = req.body;
        if (!mnemonic) {
            return res.status(400).json({ success: false, error: "Keyphrase is required." });
        }

        const keypair = createKeypairFromMnemonic(mnemonic);
        const response = await server.claimableBalances().claimant(keypair.publicKey()).limit(100).call();
        const balances = response.records.map(r => ({ id: r.id, amount: r.amount, asset: "PI" }));

        return res.status(200).json({ success: true, balances, publicKey: keypair.publicKey() });

    } catch (error) {
        console.error("FATAL ERROR in getClaimableBalances:", error.message);
        let detailedError = "A server error occurred while fetching balances.";
        if (error.message.includes("Invalid keyphrase")) {
            detailedError = error.message;
        } else if (error.message.toLowerCase().includes('timeout')) {
            detailedError = "Connection to Pi network timed out. Please try again.";
        } else if (error.response?.status === 404) {
             detailedError = "This account was not found on the Pi network.";
        }
        
        // हमेशा एक सही JSON एरर भेजें
        return res.status(500).json({ success: false, error: detailedError });
    }
};
