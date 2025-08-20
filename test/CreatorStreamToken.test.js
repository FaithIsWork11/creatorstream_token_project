const { expect } = require("chai");

describe("CreatorStream", function () {
  let Token, token, owner, addr1, addr2;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("CreatorStream");
    [owner, addr1, addr2] = await ethers.getSigners();

    token = await Token.deploy("CreatorStreamToken", "CST", 1000000);
    await token.deployed();
  });

  it("Should assign the total supply to the owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    const totalSupply = await token.totalSupply();
    expect(ownerBalance).to.equal(totalSupply);
  });

  it("Should transfer tokens between accounts", async function () {
    await token.transfer(addr1.address, 100);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(100);
  });

  it("Should fail if sender doesn’t have enough tokens", async function () {
    const initialOwnerBalance = await token.balanceOf(owner.address);
    await expect(
      token.connect(addr1).transfer(owner.address, 1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    const finalOwnerBalance = await token.balanceOf(owner.address);
    expect(finalOwnerBalance).to.equal(initialOwnerBalance);
  });
});
