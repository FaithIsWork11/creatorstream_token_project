const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Starting the script...");

  // Get the sender account
  const [sender] = await ethers.getSigners();
  console.log(`👤 Sender address: ${sender.address}`);

  // Get the token contract
  console.log(`🔍 Fetching contract at address: ${process.env.TOKEN_CONTRACT_ADDRESS}`);
  const token = await ethers.getContractAt("CreatorStream", process.env.TOKEN_CONTRACT_ADDRESS);

  // Define the Gnosis Safe address and amount to transfer
  const safeAddress = "0xYourGnosisSafeAddress"; // Replace this
  console.log(`🏦 Safe address: ${safeAddress}`);
  const amount = ethers.utils.parseUnits("1000", 18); // Sending 1000 CST
  console.log(`💰 Amount to send: ${ethers.utils.formatUnits(amount, 18)} CST`);

  // Check sender's balance before transfer
  const senderBalance = await token.balanceOf(sender.address);
  console.log(`💳 Sender balance: ${ethers.utils.formatUnits(senderBalance, 18)} CST`);

  if (senderBalance.lt(amount)) {
    console.error("❌ Insufficient balance to perform the transfer.");
    process.exit(1);
  }

  // Perform the transfer
  console.log("🚀 Sending tokens...");
  const tx = await token.transfer(safeAddress, amount);
  console.log(`⏳ Transaction hash: ${tx.hash}`);
  await tx.wait();

  console.log(`✅ Sent 1000 CST to Safe at ${safeAddress}`);
}

main().catch((error) => {
  console.error("❌ An error occurred:", error);
  process.exit(1);
});