const {
  getBlockchainConfig,
  isBlockchainConfigured,
  getProvider,
  getDocumentRegistryContract
} = require("../config/blockchain");

const notConfiguredResult = {
  success: false,
  status: "NOT_CONFIGURED",
  message: "Blockchain is not configured"
};

const getCleanErrorMessage = (error) => {
  return error.shortMessage || error.reason || error.message || "Blockchain operation failed";
};

const registerDocumentVersion = async ({ docId, fileHash, versionNumber }) => {
  if (!isBlockchainConfigured()) {
    return notConfiguredResult;
  }

  try {
    const contract = getDocumentRegistryContract();
    const tx = await contract.registerDocumentVersion(docId, fileHash, versionNumber);
    const receipt = await tx.wait();

    return {
      success: true,
      status: "STORED",
      txHash: receipt.hash || tx.hash
    };
  } catch (error) {
    console.error("Blockchain register version failed:", getCleanErrorMessage(error));
    return {
      success: false,
      status: "FAILED",
      message: getCleanErrorMessage(error)
    };
  }
};

const revokeDocument = async ({ docId, reason }) => {
  if (!isBlockchainConfigured()) {
    return notConfiguredResult;
  }

  try {
    const contract = getDocumentRegistryContract();
    const tx = await contract.revokeDocument(docId, reason);
    const receipt = await tx.wait();

    return {
      success: true,
      status: "STORED",
      txHash: receipt.hash || tx.hash
    };
  } catch (error) {
    console.error("Blockchain revoke failed:", getCleanErrorMessage(error));
    return {
      success: false,
      status: "FAILED",
      message: getCleanErrorMessage(error)
    };
  }
};

const verifyDocument = async ({ docId, fileHash }) => {
  if (!isBlockchainConfigured()) {
    return notConfiguredResult;
  }

  try {
    const contract = getDocumentRegistryContract();
    const result = await contract.verifyDocument(docId, fileHash);

    return {
      success: true,
      status: "AVAILABLE",
      data: {
        hashExists: result[0],
        matchedVersionNumber: Number(result[1]),
        isRevoked: result[2],
        revocationReason: result[3]
      }
    };
  } catch (error) {
    console.error("Blockchain verify failed:", getCleanErrorMessage(error));
    return {
      success: false,
      status: "FAILED",
      message: getCleanErrorMessage(error)
    };
  }
};

const getStatus = async () => {
  const { contractAddress } = getBlockchainConfig();
  const provider = getProvider();
  const configured = isBlockchainConfigured();

  if (!provider) {
    return {
      rpcReachable: false,
      contractConfigured: Boolean(contractAddress),
      configured,
      network: null,
      message: "BLOCKCHAIN_RPC_URL is not configured"
    };
  }

  try {
    const network = await provider.getNetwork();

    return {
      rpcReachable: true,
      contractConfigured: Boolean(contractAddress),
      configured,
      network: {
        name: network.name,
        chainId: Number(network.chainId)
      }
    };
  } catch (error) {
    return {
      rpcReachable: false,
      contractConfigured: Boolean(contractAddress),
      configured,
      network: null,
      message: getCleanErrorMessage(error)
    };
  }
};

module.exports = {
  registerDocumentVersion,
  revokeDocument,
  verifyDocument,
  getStatus
};
