require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    stratos: {
      url: "https://rpc.your-stratos-node.org", // Replace with actual Stratos RPC
      accounts: ["0xYOUR_PRIVATE_KEY"]
    }
  }
};