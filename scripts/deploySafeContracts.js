const { ethers } = require('hardhat');

async function main() {
  const SafeSingletonFactory = await ethers.getContractFactory('Safe');
  const safeSingleton = await SafeSingletonFactory.deploy();
  await safeSingleton.deployed();

  const SafeProxyFactory = await ethers.getContractFactory('SafeProxyFactory');
  const safeProxyFactory = await SafeProxyFactory.deploy();
  await safeProxyFactory.deployed();

  const MultiSend = await ethers.getContractFactory('MultiSend');
  const multiSend = await MultiSend.deploy();
  await multiSend.deployed();

  const MultiSendCallOnly = await ethers.getContractFactory('MultiSendCallOnly');
  const multiSendCallOnly = await MultiSendCallOnly.deploy();
  await multiSendCallOnly.deployed();

  const Handler = await ethers.getContractFactory('CompatibilityFallbackHandler');
  const handler = await Handler.deploy();
  await handler.deployed();

  const SignMessageLib = await ethers.getContractFactory('SignMessageLib');
  const signMessageLib = await SignMessageLib.deploy();
  await signMessageLib.deployed();

  const CreateCall = await ethers.getContractFactory('CreateCall');
  const createCall = await CreateCall.deploy();
  await createCall.deployed();

  const SimulateTxAccessor = await ethers.getContractFactory('SimulateTxAccessor');
  const simulateTxAccessor = await SimulateTxAccessor.deploy();
  await simulateTxAccessor.deployed();

  const { chainId } = await ethers.provider.getNetwork();
  console.log('\ncontractNetworks for Protocol Kit:\n', JSON.stringify({
    [Number(chainId)]: {
      safeSingletonAddress: safeSingleton.address,
      safeProxyFactoryAddress: safeProxyFactory.address,
      multiSendAddress: multiSend.address,
      multiSendCallOnlyAddress: multiSendCallOnly.address,
      fallbackHandlerAddress: handler.address,
      signMessageLibAddress: signMessageLib.address,
      createCallAddress: createCall.address,
      simulateTxAccessorAddress: simulateTxAccessor.address
    }
  }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
