require("dotenv").config();
const { ethers } = require("hardhat");
const SafeFactory = require("@safe-global/protocol-kit").default;
const { EthersAdapter } = require("@safe-global/protocol-kit");

async function main() {
  // 1. Connect to Stratos RPC
  const provider = new ethers.providers.JsonRpcProvider(process.env.STRATOS_RPC_URL);

  // 2. Use PRIVATE_KEY to create a signer
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // 3. Create EthersAdapter (manually)
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });

  // 4. Create SafeFactory
  const safeFactory = await SafeFactory.create({ ethAdapter });

  // 5. Set Safe owners
  const safeAccounts = [
    process.env.SAFE_OWNER_1 || signer.address,
    // Add more owners here
  ];

  // 6. Set approval threshold
  const threshold = parseInt(process.env.SAFE_THRESHOLD || "1");

  // 7. Deploy the Safe
  const safeSdk = await safeFactory.deploySafe({
    safeAccountConfig: {
      owners: safeAccounts,
      threshold,
    },
  });

  const safeAddress = await safeSdk.getAddress();
  console.log("✅ Gnosis Safe deployed to:", safeAddress);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
