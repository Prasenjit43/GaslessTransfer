const { expect } = require("chai")
const { ethers } = require("hardhat")


async function getPermitSignature(signer, token, spender, value, deadline) {
  const [nonce, name, version, chainId] = await Promise.all([
    token.nonces(signer.address),
    token.name(),
    "1",
    signer.getChainId(),
  ])

  return ethers.utils.splitSignature(
    await signer._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.address,
      },
      {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        owner: signer.address,
        spender,
        value,
        nonce,
        deadline,
      }
    )
  )
}

let contractDeployer, bob;
let customtoken;
let gaslesstokentransfer;
let provider;

before(async () => {
  [contractDeployer, bob, alice, jane] = await ethers.getSigners();
  provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');

});

describe("Contract Deployement", () => {
  it("Should Deploy Custom Token Smart Contract", async () => {
    const CustomToken = await ethers.getContractFactory("CustomToken");
    customtoken = await CustomToken.connect(contractDeployer).deploy();
    await customtoken.deployed();

    const GasLessTokenTransfer = await ethers.getContractFactory("GasLessTokenTransfer");
    gaslesstokentransfer = await GasLessTokenTransfer.connect(contractDeployer).deploy();
    await gaslesstokentransfer.deployed();

    expect((customtoken.address).toString()).not.equal("");
    expect((gaslesstokentransfer.address).toString()).not.equal("");
  });
});

describe("Add Token to Bob & Alice", () => {
  it("Balance of Contract Deployer", async () => {
    const balance = await customtoken.connect(contractDeployer).balanceOf(contractDeployer.address);
    expect(balance.toString()).to.equal((await customtoken.connect(contractDeployer).totalSupply()).toString());
  });
  it("Transfer 10000 Token to Bob", async () => {
    let balance = await customtoken.connect(bob).balanceOf(bob.address);
    expect(balance.toString()).to.equal("0");
    await customtoken.connect(contractDeployer).transfer(bob.address, 10000);
    balance = await customtoken.connect(bob).balanceOf(bob.address);
    expect(balance.toString()).to.equal("10000");
  });
  it("Transfer 50000 Token to Alice", async () => {
    let balance = await customtoken.connect(alice).balanceOf(alice.address);
    expect(balance.toString()).to.equal("0");
    await customtoken.connect(contractDeployer).transfer(alice.address, 50000);
    balance = await customtoken.connect(alice).balanceOf(alice.address);
    expect(balance.toString()).to.equal("50000");
  });
  it("Transfer 50000 Token to Jane", async () => {
    let balance = await customtoken.connect(jane).balanceOf(jane.address);
    expect(balance.toString()).to.equal("0");
    await customtoken.connect(contractDeployer).transfer(jane.address, 30000);
    balance = await customtoken.connect(jane).balanceOf(jane.address);
    expect(balance.toString()).to.equal("30000");
  });
});

describe("Gasless - Transfer token from Bob & Alice", () => {
  const value = 1000;
  const fee = 100;
  const deadline = Math.floor(Date.now() / 1000) + (60 * 10);
  it("Create Signature and Permit", async () => {
    const { v, r, s } = await getPermitSignature(
      bob,
      customtoken,
      gaslesstokentransfer.address,
      value + fee,
      deadline
    );

    const bobTokenBalanceBefore = await customtoken.connect(bob).balanceOf(bob.address);
    const aliceTokenBalanceBefore = await customtoken.connect(alice).balanceOf(alice.address);
    const janeTokenBalanceBefore = await customtoken.connect(jane).balanceOf(jane.address);
    const bobEtherBefore = await provider.getBalance(bob.address);
    const aliceEtherBefore = await provider.getBalance(alice.address);
    const janeEtherBefore = await provider.getBalance(jane.address);

    await gaslesstokentransfer.connect(jane).sendTransaction(
      customtoken.address,
      bob.address,
      alice.address,
      value,
      fee,
      deadline,
      v,
      r,
      s
    );

    const bobTokenBalanceAfter = await customtoken.connect(bob).balanceOf(bob.address);
    const aliceTokenBalanceAfter = await customtoken.connect(alice).balanceOf(alice.address);
    const janeTokenBalanceAfter = await customtoken.connect(jane).balanceOf(jane.address);
    const bobEtherAfter = await provider.getBalance(bob.address);
    const aliceEtherAfter = await provider.getBalance(alice.address);
    const janeEtherAfter = await provider.getBalance(jane.address);

    expect(bobTokenBalanceBefore.eq(bobTokenBalanceAfter.add(ethers.BigNumber.from(value + fee)))).to.be.true;
    expect(aliceTokenBalanceBefore.eq(aliceTokenBalanceAfter.sub(ethers.BigNumber.from(value)))).to.be.true;
    expect(janeTokenBalanceBefore.eq(janeTokenBalanceAfter.sub(ethers.BigNumber.from(fee)))).to.be.true;
    expect(bobEtherBefore.eq(bobEtherAfter)).to.be.true;
    expect(aliceEtherBefore.eq(aliceEtherAfter)).to.be.true;
    expect(janeEtherBefore.gt(janeEtherAfter)).to.be.true;

  });
});
