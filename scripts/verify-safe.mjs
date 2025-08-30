// scripts/verify-safe.mjs
import 'dotenv/config';
import Safe from '@safe-global/protocol-kit';

const { STRATOS_RPC_URL, PRIVATE_KEY, SAFE_ADDRESS } = process.env;
if (!STRATOS_RPC_URL || !PRIVATE_KEY || !SAFE_ADDRESS) throw new Error('Missing RPC/PK/SAFE_ADDRESS');

const kit = await Safe.init({
  provider: STRATOS_RPC_URL,
  signer: PRIVATE_KEY,
  safeAddress: SAFE_ADDRESS
});

console.log('Safe:', await kit.getAddress());
console.log('Owners:', await kit.getOwners());
console.log('Threshold:', await kit.getThreshold());
