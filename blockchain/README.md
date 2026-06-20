# Blockchain Module - DocumentRegistry

This is Module 3 of the Blockchain-based Document Authentication and Integrity Verification System. It contains a simple Solidity smart contract for document hash registration, version tracking, revocation management, and public verification.

The blockchain module is not connected to the backend yet. Backend integration with ethers.js will be done in Module 4.

## Tech Used

- Solidity
- Hardhat
- ethers.js
- Local Hardhat network

## Setup

Install dependencies:

```bash
npm install
```

Compile contracts:

```bash
npm run compile
```

Run tests:

```bash
npm test
```

Start local Hardhat node:

```bash
npx hardhat node
```

Deploy to local Hardhat node:

```bash
npm run deploy
```

## Contract

Contract file:

```text
contracts/DocumentRegistry.sol
```

Contract name:

```text
DocumentRegistry
```

## Main Functions

### registerDocumentVersion

```solidity
registerDocumentVersion(string docId, string fileHash, uint256 versionNumber)
```

Registers a document version on-chain.

Stores:

- `docId`
- `fileHash`
- `versionNumber`
- issuer address
- timestamp
- revoked status as `false`

It rejects registration if the document has already been revoked.

### getTotalVersions

```solidity
getTotalVersions(string docId)
```

Returns the total number of versions registered for a document.

### getLatestVersionNumber

```solidity
getLatestVersionNumber(string docId)
```

Returns the latest version number for a document.

### getVersionDetails

```solidity
getVersionDetails(string docId, uint256 versionNumber)
```

Returns details for a specific document version.

### revokeDocument

```solidity
revokeDocument(string docId, string reason)
```

Revokes a registered document and stores:

- `docId`
- reason
- revoker address
- timestamp
- revoked status

### getRevocationDetails

```solidity
getRevocationDetails(string docId)
```

Returns revocation details for a document.

### isDocumentRevoked

```solidity
isDocumentRevoked(string docId)
```

Returns whether a document has been revoked.

### verifyDocument

```solidity
verifyDocument(string docId, string fileHash)
```

Checks whether a hash exists for the given document.

Returns:

- whether the hash exists
- matched version number
- whether the document is revoked
- revocation reason if revoked

## Test Coverage

Tests are in:

```text
test/DocumentRegistry.test.js
```

Covered cases:

1. Register first version
2. Register second version
3. Verify latest version hash
4. Verify old version hash
5. Verify invalid hash
6. Revoke document
7. Verify revoked document
8. Reject new version after revocation

## Notes

- This module intentionally has no advanced access control.
- Any address can register or revoke for now.
- Admin authentication will be handled later by backend/admin modules or described as future scope.
- Strings are used for `docId` and `fileHash` for college-project readability.
