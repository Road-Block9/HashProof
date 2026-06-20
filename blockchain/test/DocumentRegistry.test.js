const assert = require("assert");
const { ethers } = require("hardhat");

describe("DocumentRegistry", function () {
  const docId = "DOC-TEST-001";
  const firstHash = "sha256-first-version-hash";
  const secondHash = "sha256-second-version-hash";
  const invalidHash = "sha256-invalid-hash";

  let registry;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const DocumentRegistry = await ethers.getContractFactory("DocumentRegistry");
    registry = await DocumentRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("registers the first version", async function () {
    await registry.registerDocumentVersion(docId, firstHash, 1);

    const totalVersions = await registry.getTotalVersions(docId);
    const latestVersion = await registry.getLatestVersionNumber(docId);
    const versionDetails = await registry.getVersionDetails(docId, 1);

    assert.equal(totalVersions, 1n);
    assert.equal(latestVersion, 1n);
    assert.equal(versionDetails[0], docId);
    assert.equal(versionDetails[1], firstHash);
    assert.equal(versionDetails[2], 1n);
    assert.equal(versionDetails[3], owner.address);
    assert.equal(versionDetails[5], false);
  });

  it("registers the second version", async function () {
    await registry.registerDocumentVersion(docId, firstHash, 1);
    await registry.registerDocumentVersion(docId, secondHash, 2);

    const totalVersions = await registry.getTotalVersions(docId);
    const latestVersion = await registry.getLatestVersionNumber(docId);
    const versionDetails = await registry.getVersionDetails(docId, 2);

    assert.equal(totalVersions, 2n);
    assert.equal(latestVersion, 2n);
    assert.equal(versionDetails[1], secondHash);
    assert.equal(versionDetails[2], 2n);
  });

  it("verifies the latest version hash", async function () {
    await registry.registerDocumentVersion(docId, firstHash, 1);
    await registry.registerDocumentVersion(docId, secondHash, 2);

    const result = await registry.verifyDocument(docId, secondHash);

    assert.equal(result[0], true);
    assert.equal(result[1], 2n);
    assert.equal(result[2], false);
    assert.equal(result[3], "");
  });

  it("verifies an old version hash", async function () {
    await registry.registerDocumentVersion(docId, firstHash, 1);
    await registry.registerDocumentVersion(docId, secondHash, 2);

    const result = await registry.verifyDocument(docId, firstHash);

    assert.equal(result[0], true);
    assert.equal(result[1], 1n);
    assert.equal(result[2], false);
  });

  it("returns false for an invalid hash", async function () {
    await registry.registerDocumentVersion(docId, firstHash, 1);

    const result = await registry.verifyDocument(docId, invalidHash);

    assert.equal(result[0], false);
    assert.equal(result[1], 0n);
    assert.equal(result[2], false);
  });

  it("revokes a document", async function () {
    const reason = "Incorrect document details";

    await registry.registerDocumentVersion(docId, firstHash, 1);
    await registry.revokeDocument(docId, reason);

    const isRevoked = await registry.isDocumentRevoked(docId);
    const revocationDetails = await registry.getRevocationDetails(docId);
    const versionDetails = await registry.getVersionDetails(docId, 1);

    assert.equal(isRevoked, true);
    assert.equal(revocationDetails[0], docId);
    assert.equal(revocationDetails[1], reason);
    assert.equal(revocationDetails[2], owner.address);
    assert.equal(revocationDetails[4], true);
    assert.equal(versionDetails[5], true);
  });

  it("verifies a revoked document", async function () {
    const reason = "Certificate cancelled by issuer";

    await registry.registerDocumentVersion(docId, firstHash, 1);
    await registry.revokeDocument(docId, reason);

    const result = await registry.verifyDocument(docId, firstHash);

    assert.equal(result[0], true);
    assert.equal(result[1], 1n);
    assert.equal(result[2], true);
    assert.equal(result[3], reason);
  });

  it("rejects new version registration after revocation", async function () {
    await registry.registerDocumentVersion(docId, firstHash, 1);
    await registry.revokeDocument(docId, "Revoked before second version");

    await assert.rejects(
      registry.registerDocumentVersion(docId, secondHash, 2),
      /Document is revoked/
    );
  });
});
