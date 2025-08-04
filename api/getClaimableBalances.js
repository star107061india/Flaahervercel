// File: api/getClaimableBalances.js (Final Vercel Version)

const { Keypair, Horizon } = require('stellar-sdk');
const { mnemonicToSeedSync } = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const axios = require('axios');

// Vercel के लिए: server इंस्टेंस को हैंडलर के अंदर बनाएँ
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
        const { mnemonic } = req.body;
        if (!mnemonic) return res.status(400).json({ success: false, error: "Keyphrase is required." });

        const keypair = createKeypairFromMnemonic(mnemonic);
        const server = createServer();
        const response = await server.claimableBalances().claimant(keypair.publicKey()).limit(100).call();
        const balances = response.records.map(r => ({ id: r.id, amount: r.amount, asset: "PI" }));

        return res.status(200).json({ success: true, balances, publicKey: keypair.publicKey() });
    } catch (error) {
        console.error("Error in getClaimableBalances:", error);
        let detailedError = "An unknown server error occurred.";
        if (error.message) detailedError = error.message;
        if (error.response?.data?.detail) detailedError = error.response.data.detail;
        if (error.message.toLowerCase().includes('timeout')) detailedError = "Connection to Pi network timed out. It might be busy. Please try again.";
        
        return res.status(500).json({ success: false, error: detailedError });
    }
};
