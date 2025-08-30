// scripts/deploy-safe.mjs
import 'dotenv/config';
import Safe from '@safe-global/protocol-kit';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http, getAddress } from 'viem';

const RPC_URL = (process.env.STRATOS_RPC_URL || '').trim();
let   PRIVATE_KEY = (process.env.PRIVATE_KEY || '').trim();
const CHAIN_ID = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : undefined;

if (!RPC_URL) throw new Error('Missing STRATOS_RPC_URL');
if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY');
if (!PRIVATE_KEY.startsWith('0x') && /^[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) PRIVATE_KEY = '0x' + PRIVATE_KEY;
if (!/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) throw new Error('PRIVATE_KEY must be 0x-prefixed 64-hex');

const publicClient = createPublicClient({ transport: http(RPC_URL) });

async function mustBeContract(name, v) {
  const raw = (v || '').trim().replace(/^['"]|['"]$/g, '');
  if (!raw) throw new Error(`${name} missing`);
  let addr; try { addr = getAddress(raw); } catch { throw new Error(`${name} invalid: ${raw}`); }
  const code = await publicClient.getBytecode({ address: addr });
  if (!code || code === '0x') throw new Error(`${name} has no code on-chain: ${addr}`);
  return addr;
}

async function buildContractNetworks(chainId) {
  return {
    [chainId]: {
      safeSingletonAddress:      await mustBeContract('SAFE_SINGLETON_ADDRESS', process.env.SAFE_SINGLETON_ADDRESS),
      safeProxyFactoryAddress:   await mustBeContract('SAFE_PROXY_FACTORY_ADDRESS', process.env.SAFE_PROXY_FACTORY_ADDRESS),
      multiSendAddress:          await mustBeContract('SAFE_MULTI_SEND_ADDRESS', process.env.SAFE_MULTI_SEND_ADDRESS),
      multiSendCallOnlyAddress:  await mustBeContract('SAFE_MULTI_SEND_CALL_ONLY_ADDRESS', process.env.SAFE_MULTI_SEND_CALL_ONLY_ADDRESS),
      fallbackHandlerAddress:    await mustBeContract('SAFE_FALLBACK_HANDLER_ADDRESS', process.env.SAFE_FALLBACK_HANDLER_ADDRESS),
      signMessageLibAddress:     await mustBeContract('SAFE_SIGN_MESSAGE_LIB_ADDRESS', process.env.SAFE_SIGN_MESSAGE_LIB_ADDRESS),
      createCallAddress:         await mustBeContract('SAFE_CREATE_CALL_ADDRESS', process.env.SAFE_CREATE_CALL_ADDRESS),
      simulateTxAccessorAddress: await mustBeContract('SAFE_SIMULATE_TX_ACCESSOR_ADDRESS', process.env.SAFE_SIMULATE_TX_ACCESSOR_ADDRESS)
    }
  };
}

async function main() {
  const rpcChainId = await publicClient.getChainId();
  const chainId = CHAIN_ID || rpcChainId;

  const account   = privateKeyToAccount(PRIVATE_KEY);
  const owners    = [process.env.SAFE_OWNER_1?.trim() || account.address];
  const threshold = parseInt(process.env.SAFE_THRESHOLD || '1', 10);

  const kit = await Safe.init({
    provider: RPC_URL,
    signer: PRIVATE_KEY,
    predictedSafe: { safeAccountConfig: { owners, threshold } },
    contractNetworks: await buildContractNetworks(chainId),
    // OPTIONAL: if you ever want a different address, set a unique salt:
    // safeDeploymentConfig: { saltNonce: (process.env.SAFE_SALT_NONCE || Date.now().toString()) }
  });

  const predictedAddr = await kit.getAddress();
  console.log('Predicted Safe address:', predictedAddr);

  // If there’s already code, just connect and exit
  const existingCode = await publicClient.getBytecode({ address: predictedAddr });
  if (existingCode && existingCode !== '0x') {
    console.log('ℹ️ Safe already deployed, connecting instead...');
    const deployedKit = await kit.connect({ safeAddress: predictedAddr });
    console.log('✅ Connected to existing Safe:', await deployedKit.getAddress());
    return;
  }

  // Otherwise, deploy it now
  const deploymentTx = await kit.createSafeDeploymentTransaction();
  const walletClient = await kit.getSafeProvider().getExternalSigner();
  const hash = await walletClient.sendTransaction({
    to: deploymentTx.to,
    value: BigInt(deploymentTx.value),
    data: deploymentTx.data
  });
  console.log('Tx hash:', hash);

  await publicClient.waitForTransactionReceipt({ hash });

  const deployedKit = await kit.connect({ safeAddress: predictedAddr });
  if (!(await deployedKit.isSafeDeployed())) throw new Error('Safe not detected as deployed');
  console.log('✅ Safe deployed at:', predictedAddr);
}

main().catch((e) => { console.error('❌ Deployment failed:', e.message || e); process.exit(1); });
