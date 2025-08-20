const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const token = await ethers.getContractAt("CreatorStreamToken", process.env.TOKEN_CONTRACT_ADDRESS);
  const balance = await token.balanceOf(deployer.address);
  console.log(`Balance of deployer: ${ethers.utils.formatUnits(balance, 18)} CST`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
