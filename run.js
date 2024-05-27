import { deriveChildPublicKey, najPublicKeyStrToUncompressedHexPoint, uncompressedHexPointToEvmAddress, uncompressedHexPointToBtcAddress } from './kdf.mjs';
import * as bitcoin from "bitcoinjs-lib";

async function deriveEthAddress(accountId, derivation_path = '') {
    const publicKey = await deriveChildPublicKey(najPublicKeyStrToUncompressedHexPoint(), accountId, derivation_path);
    const address = await uncompressedHexPointToEvmAddress(publicKey);
    console.log(address);
  }

async function deriveBtcAddress(accountId, derivation_path = '') {
  const publicKey = await deriveChildPublicKey(najPublicKeyStrToUncompressedHexPoint(), accountId, derivation_path);
  const address = await uncompressedHexPointToBtcAddress(publicKey, bitcoin.networks.testnet);
  console.log(address);
}

const args = process.argv.slice(2);
const currencyType = args[0];  // First argument: 'eth' or 'btc'
const accountId = args[1];     // Second argument: account ID
const derivationPath = args[2] || '';  // Third argument: optional derivation path

if (!currencyType || !accountId) {
    console.log("Usage: node script.js [eth|btc] <accountId> [<derivationPath>]");
    process.exit(1);
}

if (currencyType.toLowerCase() === 'eth') {
    deriveEthAddress(accountId, derivationPath);
} else if (currencyType.toLowerCase() === 'btc') {
    deriveBtcAddress(accountId, derivationPath);
} else {
    console.log("Invalid network type specified. Use 'eth' for Ethereum or 'btc' for Bitcoin.");
    process.exit(1);
}
