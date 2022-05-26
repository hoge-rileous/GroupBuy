// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  console.log(blockBefore);

  console.log("Account balance:", (await deployer.getBalance()).toString());

    const GroupBuy = await ethers.getContractFactory("GroupBuy");
    const groupBuy = await GroupBuy.deploy({gasLimit: blockBefore.gasLimit});
    await groupBuy.deployed();

  console.log("groupbuy address:", groupBuy.address);

    const GroupBuyFactory = await ethers.getContractFactory("GroupBuyFactory");
    const groupBuyFactory = await GroupBuyFactory.deploy(groupBuy.address, {gasLimit: blockBefore.gasLimit});
    await groupBuyFactory.deployed();

  console.log("factory address:", groupBuyFactory.address);

/*  vendors = [];
    const vendorAddressTxn = await vendorFactory.createVendor('50000000', '400000000');
    const vendorCreationRcpt = await vendorAddressTxn.wait();
    const createEvent = vendorCreationRcpt.events.find(event => event.event === 'VendorCreated');
    const vendor1Address = createEvent.args.vendor; 
    vendors.push(vendor1Address);   

    await deployer.sendTransaction({
      to: vendor1Address,
      value: ethers.utils.parseEther("1.0")
    });

    const vendor2AddressTxn = await vendorFactory.createVendor('70000000', '30000000');
    const vendor2CreationRcpt = await vendor2AddressTxn.wait();
    const createEvent2 = vendor2CreationRcpt.events.find(event => event.event === 'VendorCreated');
    const vendor2Address = createEvent2.args.vendor; 
    vendors.push(vendor2Address);   

  console.log("Vendor1 address:", vendor1Address);*/

  // We also save the contract's artifacts and address in the frontend directory
  //saveFrontendFiles(hogeVendor, vendorFactory, vendors);
  saveFrontendFiles(optiSwap);
}

function saveFrontendFiles(optiSwap) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../hogevault-frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const OptiSwapArtifact = artifacts.readArtifactSync("OptiSwap");

  fs.writeFileSync(
    contractsDir + "/opti-swap-address.json",
    JSON.stringify({ address: optiSwap.address }, undefined, 2)
  );  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
