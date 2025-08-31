// scripts/verify-safe.mjs
import 'dotenv/config';
import Safe from '@safe-global/protocol-kit';
import { createPublicClient, http, getAddress } from 'viem';

const RPC_URL     = (process.env.STRATOS_RPC_URL || '').trim();
const PRIVATE_KEY = (process.env.PRIVATE_KEY || '').trim();
const SAFE_ADDRESS = (process.env.SAFE_ADDRESS || '').trim();

if (!RPC_URL) throw new Error('Missing STRATOS_RPC_URL');
if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY');
if (!SAFE_ADDRESS) throw new Error('Missing SAFE_ADDRESS');

const publicClient = createPublicClient({ transport: http(RPC_URL) });
const clean = (v) => (v || '').trim().replace(/^['"]|['"]$/g, '');

async function mustBeContract(envKey) {
  const raw = clean(process.env[envKey]);
  if (!raw) throw new Error(`${envKey} missing`);
  let addr;
  try { addr = getAddress(raw); } catch { throw new Error(`${envKey} invalid: ${raw}`); }
  const code = await publicClient.getBytecode({ address: addr });
  if (!code || code === '0x') throw new Error(`${envKey} has NO bytecode on-chain: ${addr}`);
  return addr;
}

async function main() {
  const chainId = await publicClient.getChainId();

  // Ensure SAFE_ADDRESS is a real contract
  let safeAddr;
  try { safeAddr = getAddress(SAFE_ADDRESS); } catch { throw new Error(`SAFE_ADDRESS invalid: ${SAFE_ADDRESS}`); }
  const safeCode = await publicClient.getBytecode({ address: safeAddr });
  if (!safeCode || safeCode === '0x') throw new Error(`SAFE_ADDRESS has no bytecode on-chain: ${safeAddr}`);

  // Build contractNetworks keyed by the RPC chain id (critical on custom chains)
  const contractNetworks = {
    [chainId]: {
      safeSingletonAddress:      await mustBeContract('SAFE_SINGLETON_ADDRESS'),
      safeProxyFactoryAddress:   await mustBeContract('SAFE_PROXY_FACTORY_ADDRESS'),
      multiSendAddress:          await mustBeContract('SAFE_MULTI_SEND_ADDRESS'),
      multiSendCallOnlyAddress:  await mustBeContract('SAFE_MULTI_SEND_CALL_ONLY_ADDRESS'),
      fallbackHandlerAddress:    await mustBeContract('SAFE_FALLBACK_HANDLER_ADDRESS'),
      signMessageLibAddress:     await mustBeContract('SAFE_SIGN_MESSAGE_LIB_ADDRESS'),
      createCallAddress:         await mustBeContract('SAFE_CREATE_CALL_ADDRESS'),
      simulateTxAccessorAddress: await mustBeContract('SAFE_SIMULATE_TX_ACCESSOR_ADDRESS')
    }
  };

  const kit = await Safe.init({
    provider: RPC_URL,
    signer: PRIVATE_KEY,
    safeAddress: safeAddr,
    contractNetworks
  });

  console.log('Safe:', await kit.getAddress());
  console.log('Owners:', await kit.getOwners());
  console.log('Threshold:', await kit.getThreshold());
}

main().catch((e) => {
  console.error('❌', e.message || e);
  process.exit(1);
});
