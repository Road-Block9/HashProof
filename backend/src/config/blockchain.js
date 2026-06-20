const { ethers } = require("ethers");
const documentRegistryAbi = require("../blockchain/DocumentRegistryABI.json");

const getBlockchainConfig = () => {
  return {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CONTRACT_ADDRESS
  };
};

const isBlockchainConfigured = () => {
  const { rpcUrl, privateKey, contractAddress } = getBlockchainConfig();
  return Boolean(rpcUrl && privateKey && contractAddress);
};

const getProvider = () => {
  const { rpcUrl } = getBlockchainConfig();

  if (!rpcUrl) {
    return null;
  }

  return new ethers.JsonRpcProvider(rpcUrl);
};

const getDocumentRegistryContract = () => {
  const { privateKey, contractAddress } = getBlockchainConfig();
  const provider = getProvider();

  if (!provider || !privateKey || !contractAddress) {
    return null;
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, documentRegistryAbi, wallet);
};

module.exports = {
  getBlockchainConfig,
  isBlockchainConfigured,
  getProvider,
  getDocumentRegistryContract
};
