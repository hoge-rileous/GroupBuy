require('dotenv').config()
const { ethers } = require("hardhat");
const { expect } = require("chai");

let hogeAddr = "0xfAd45E47083e4607302aa43c65fB3106F1cd7607";
const erc20 = require("../contracts/erc20.json");

describe("GroupBuyFactory", async (accounts) => {

  beforeEach(async () => {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.alchemyAPI,
            blockNumber: 14573039,
          },
        },
      ],
    });
  });


  it("should deploy proxy groupbuy from factory.", async function () {
    const hoge = await ethers.getContractAt(erc20, hogeAddr);

    const accounts = await ethers.getSigners();
    const provider = ethers.provider;

    const GroupBuy = await ethers.getContractFactory("GroupBuy");
    const groupBuy = await GroupBuy.deploy();
    await groupBuy.deployed();

    const GroupBuyFactory = await ethers.getContractFactory("GroupBuyFactory");
    const groupBuyFactory = await GroupBuyFactory.deploy(groupBuy.address);
    await groupBuyFactory.deployed();

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    const groupBuyAddressTxn = await groupBuyFactory.createGroupBuy(hogeAddr, "1000000", timestampBefore + 1000);
    const groupBuyCreationRcpt = await groupBuyAddressTxn.wait();
    const createEvent = groupBuyCreationRcpt.events.find(event => event.event === 'GroupBuyCreated');
    const gb1_addr = createEvent.args.groupBuy;    

    const gb1 = await ethers.getContractAt("GroupBuy", gb1_addr);
    
    let share = await gb1.getContributionOf(accounts[0].address);
    expect(share).to.equal(0);

    //Can't push over the threshold
    await expect(gb1.contribute({
      value: 1000001})).to.be.revertedWith("Contribution too large!");
    await gb1.contribute({
      value: 1000000
    });    

    share = await gb1.getContributionOf(accounts[0].address);
    expect(share).to.equal(1000000);

    //Can't recover funds until deadline has passed.
    await expect(gb1.recover()).to.be.revertedWith("GroupBuy is still active.");

    await ethers.provider.send('evm_increaseTime', [1001]);
    await ethers.provider.send('evm_mine');
    await gb1.recover();

    share = await gb1.getContributionOf(accounts[0].address);
    expect(share).to.equal(0);

    //Can't finalize with less than threshold
    await expect(gb1.finalize(0, "9999999999")).to.be.revertedWith("Threshold not met!");
    
    await gb1.contribute({
      value: 1000000
    });

    await expect(gb1.claim()).to.be.revertedWith("GroupBuy not finalized yet!");

    let tokensBought = await gb1.getTokensBought();
    expect(tokensBought).to.equal(0);

    await gb1.finalize(0, "9999999999");

    tokensBought = await gb1.getTokensBought();
    expect(tokensBought).to.be.gt(0);
    console.log(tokensBought);

    expect(await hoge.balanceOf(accounts[0].address)).to.equal(0)
    share = await gb1.getContributionOf(accounts[0].address);
    expect(share).to.equal(1000000);

    await gb1.claim();
    share = await gb1.getContributionOf(accounts[0].address);
    expect(share).to.equal(0);
    expect(await hoge.balanceOf(accounts[0].address)).to.be.gt(0);

  });
});