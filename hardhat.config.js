require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    stratos: {
      url: process.env.STRATOS_RPC_URL, // from .env file
      accounts: [process.env.PRIVATE_KEY] // from .env file
    }
  }
};
// Ensure you have the STRATOS_RPC_URL and PRIVATE_KEY in your .env file
// Example .env file content:
// STRATOS_RPC_URL=https://stratos-testnet-rpc-url
// PRIVATE_KEY=your_64_char_hex_private_key