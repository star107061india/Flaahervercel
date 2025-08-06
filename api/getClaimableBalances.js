// pages/api/getClaimableBalances.js

import { Keypair, Horizon } from '@stellar/stellar-sdk';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import axios from 'axios';

const server = new Horizon.Server("https://api.mainnet.minepi.com", {
    httpClient: axios.create({ timeout: 30000 })
});

function createKeypairFromMnemonic(mnemonic) {
    try {
        return Keypair.fromRawEd25519Seed(
            derivePath("m/44'/314159'/0'", mnemonicToSeedSync(mnemonic).toString('hex')).key
        );
    } catch {
        throw new Error("Invalid keyphrase. Please check for typos or extra spaces.");
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { mnemonic } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!mnemonic) {
            return res.status(400).json({ success: false, error: "Keyphrase is required." });
        }

        const keypair = createKeypairFromMnemonic(mnemonic);
        const response = await server.claimableBalances().claimant(keypair.publicKey()).limit(100).call();
        const balances = response.records.map(r => ({ id: r.id, amount: r.amount, asset: "PI" }));

        return res.status(200).json({ success: true, balances, publicKey: keypair.publicKey() });
    } catch (error) {
        console.error("Error in getClaimableBalances:", error);
        let detailedError = "An unknown error occurred.";
        if (error.message.includes("Invalid keyphrase")) {
            detailedError = error.message;
        } else if (error.response && error.response.status === 404) {
            detailedError = "This account was not found on the Pi network. Please ensure it is activated.";
        } else if (error.message.toLowerCase().includes('timeout')) {
            detailedError = "Request to Pi network timed out. The network may be busy. Please try again in a moment.";
        } else {
            detailedError = error.message;
        }
        return res.status(500).json({ success: false, error: detailedError });
    }
}
