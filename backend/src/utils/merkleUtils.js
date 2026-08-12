const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

/**
 * Standard fields included in the Merkle Tree.
 */
const METADATA_FIELDS = [
  "title",
  "description",
  "issuerName",
  "ownerName",
  "ownerEmail",
  "documentType",
  "versionNumber"
];

/**
 * Hash a key-value pair for the Merkle leaf.
 * We format it as "key:value" (lowercase key, value as is).
 */
const hashLeaf = (key, value) => {
  const formattedValue = value === null || value === undefined ? "" : String(value);
  return keccak256(`${key}:${formattedValue}`);
};

/**
 * Generates a Merkle Tree from the document metadata.
 * @param {Object} metadata The document metadata
 * @returns {MerkleTree} The generated Merkle tree
 */
const generateDocumentMerkleTree = (metadata) => {
  const leaves = METADATA_FIELDS.map(field => hashLeaf(field, metadata[field]));
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
};

/**
 * Generates proofs for specific fields.
 * @param {Object} metadata The full document metadata
 * @param {Array<string>} fieldsToDisclose Fields the user wants to disclose
 * @returns {Object} { root, proofs: { field: { value, proof } } }
 */
const generateSelectiveDisclosureProof = (metadata, fieldsToDisclose) => {
  const tree = generateDocumentMerkleTree(metadata);
  const root = tree.getHexRoot();
  
  const proofs = {};
  
  fieldsToDisclose.forEach(field => {
    if (METADATA_FIELDS.includes(field)) {
      const leaf = hashLeaf(field, metadata[field]);
      const proof = tree.getHexProof(leaf);
      
      proofs[field] = {
        value: metadata[field],
        proof
      };
    }
  });

  return { root, proofs };
};

/**
 * Verifies a proof for a specific field against a known root.
 * @param {string} root The Merkle Root from the blockchain
 * @param {string} field The field name
 * @param {string} value The disclosed value
 * @param {Array<string>} proof The hex proof array
 * @returns {boolean} True if valid
 */
const verifyFieldProof = (root, field, value, proof) => {
  const leaf = hashLeaf(field, value);
  return MerkleTree.verify(proof, leaf, root, keccak256, { sortPairs: true });
};

module.exports = {
  METADATA_FIELDS,
  hashLeaf,
  generateDocumentMerkleTree,
  generateSelectiveDisclosureProof,
  verifyFieldProof
};
