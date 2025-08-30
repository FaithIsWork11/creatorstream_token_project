// hardhat.config.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

require('@nomiclabs/hardhat-ethers');
require('hardhat-dependency-compiler');

const clean = (v) => (v || '').toString().trim().replace(/^['"]|['"]$/g, '');
const RPC = clean(process.env.STRATOS_RPC_URL);
let PK    = clean(process.env.PRIVATE_KEY);
const CID = Number(clean(process.env.CHAIN_ID) || '');

if (PK && !PK.startsWith('0x') && /^[0-9a-fA-F]{64}$/.test(PK)) PK = `0x${PK}`;
if (!RPC) throw new Error('Missing STRATOS_RPC_URL in .env');
if (!PK)  throw new Error('Missing PRIVATE_KEY in .env');

module.exports = {
  solidity: { version: '0.8.20', settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    stratosTestnet: {
      url: RPC,
      accounts: [PK],
      chainId: Number.isFinite(CID) && CID > 0 ? CID : undefined,
      allowUnlimitedContractSize: true
    }
  },
  // keep this only if you're compiling Safe contracts from node_modules
  dependencyCompiler: {
    paths: [
      '@safe-global/safe-contracts/contracts/Safe.sol',
      '@safe-global/safe-contracts/contracts/proxies/SafeProxyFactory.sol',
      '@safe-global/safe-contracts/contracts/libraries/MultiSend.sol',
      '@safe-global/safe-contracts/contracts/libraries/MultiSendCallOnly.sol',
      '@safe-global/safe-contracts/contracts/handler/CompatibilityFallbackHandler.sol',
      '@safe-global/safe-contracts/contracts/libraries/SignMessageLib.sol',
      '@safe-global/safe-contracts/contracts/libraries/CreateCall.sol',
      '@safe-global/safe-contracts/contracts/accessors/SimulateTxAccessor.sol'
    ]
  }
};
