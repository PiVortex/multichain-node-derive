# multichain-derive-node

A repo for printing derived Ethereum and Bitcoin addresses for a specified account and derivation path # multichain-node-derive

## How to use
Download dependencies 

```
npm install
```

Run 

```
node run.js <chain> <account_id> <derivation_path>
```

Where chain is either eth or btc.

Example 

```
node run.js eth pivortex.testnet meow
```
