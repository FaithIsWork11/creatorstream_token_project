// scripts/check-contract-networks.mjs
import 'dotenv/config';
import { createPublicClient, http, getAddress } from 'viem';

const RPC = process.env.STRATOS_RPC_URL;
const ENV_CHAIN_ID = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : undefined;
if (!RPC) throw new Error('Missing STRATOS_RPC_URL');

const labels = [
  ['SAFE_SINGLETON_ADDRESS',           'safeSingletonAddress'],
  ['SAFE_PROXY_FACTORY_ADDRESS',       'safeProxyFactoryAddress'],
  ['SAFE_MULTI_SEND_ADDRESS',          'multiSendAddress'],
  ['SAFE_MULTI_SEND_CALL_ONLY_ADDRESS','multiSendCallOnlyAddress'],
  ['SAFE_FALLBACK_HANDLER_ADDRESS',    'fallbackHandlerAddress'],
  ['SAFE_SIGN_MESSAGE_LIB_ADDRESS',    'signMessageLibAddress'],
  ['SAFE_CREATE_CALL_ADDRESS',         'createCallAddress'],
  ['SAFE_SIMULATE_TX_ACCESSOR_ADDRESS','simulateTxAccessorAddress'],
];

const client = createPublicClient({ transport: http(RPC) });

function clean(v){ return (v||'').trim().replace(/^['"]|['"]$/g,''); }

(async () => {
  const rpcChainId = await client.getChainId();
  console.log(`RPC chainId: ${rpcChainId}${ENV_CHAIN_ID ? ` | .env CHAIN_ID: ${ENV_CHAIN_ID}` : ''}`);
  if (ENV_CHAIN_ID && ENV_CHAIN_ID !== rpcChainId) {
    console.error(`❌ CHAIN_ID mismatch. Use CHAIN_ID=${rpcChainId} in .env OR key your contractNetworks by ${rpcChainId}.`);
  }

  for (const [envKey, pretty] of labels) {
    const raw = clean(process.env[envKey]);
    let addr = raw;
    try { addr = getAddress(raw); } catch { /* noop */ }
    const valid = /^0x[0-9a-fA-F]{40}$/.test(addr);
    let hasCode = false;
    if (valid) {
      const code = await client.getBytecode({ address: addr });
      hasCode = !!code && code !== '0x';
    }
    console.log(`${pretty.padEnd(27)} ${addr || '(empty)'}  -> valid:${valid}  hasCode:${hasCode}`);
  }
})().catch(e => { console.error(e); process.exit(1); });
