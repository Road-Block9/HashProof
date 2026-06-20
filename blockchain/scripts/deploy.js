const hre = require("hardhat");

async function main() {
  const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
  const documentRegistry = await DocumentRegistry.deploy();

  await documentRegistry.waitForDeployment();

  console.log(`DocumentRegistry deployed to: ${await documentRegistry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
