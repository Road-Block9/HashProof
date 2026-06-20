# Backend - Document Authentication System

This backend is Module 1 of the Blockchain-based Document Authentication and Integrity Verification System. It provides document upload, SHA-256 hashing, MongoDB metadata storage, version tracking, revocation management, and verification by uploaded PDF.

## Tech Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Multer for local PDF uploads
- Node.js crypto module for SHA-256 hashing
- dotenv
- cors
- ethers.js
- nodemon

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in `backend/` using `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_local_hardhat_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
```

3. Run the backend:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

## Module 1 APIs

Base route:

```text
/api/documents
```

All responses follow this format:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

### 1. Upload New Document

```http
POST /api/documents/upload
```

Body type: `multipart/form-data`

Fields:

- `title`
- `description`
- `issuerName`
- `ownerName`
- `ownerEmail`
- `file` PDF only

Postman or Thunder Client example:

```text
Method: POST
URL: http://localhost:5000/api/documents/upload
Body: form-data
title: B.Tech Degree Certificate
description: Final degree certificate issued by college
issuerName: ABC Institute of Technology
ownerName: Rahul Sharma
ownerEmail: rahul@example.com
file: select certificate.pdf
```

Purpose:

- Uploads the first PDF version
- Generates SHA-256 hash
- Creates a `Document`
- Creates version `1`
- Calls `DocumentRegistry.registerDocumentVersion` if blockchain is configured
- Stores blockchain transaction hash in the version record if the call succeeds
- Generates a clean public `docId` like `DOC-MABC123-XYZ789`; MongoDB `_id` is not used as the public document ID

### 2. Upload New Version

```http
POST /api/documents/:docId/versions
```

Body type: `multipart/form-data`

Fields:

- `title` optional
- `description` optional
- `file` PDF only

Postman or Thunder Client example:

```text
Method: POST
URL: http://localhost:5000/api/documents/DOC-MABC123-XYZ789/versions
Body: form-data
title: B.Tech Degree Certificate - Corrected
description: Corrected spelling in owner name
file: select corrected-certificate.pdf
```

Purpose:

- Adds a new version for an existing active document
- Blocks upload if document is revoked
- Rejects upload if the new PDF hash is identical to the latest version hash
- Updates current version and latest version pointer
- Calls `DocumentRegistry.registerDocumentVersion` if blockchain is configured
- Stores blockchain transaction hash in the new version record if the call succeeds

### 3. Get Document Details

```http
GET /api/documents/:docId
```

Postman or Thunder Client example:

```text
Method: GET
URL: http://localhost:5000/api/documents/DOC-MABC123-XYZ789
```

Returns:

- Main document metadata
- Latest version details
- Revocation details if revoked

### 4. Get Version History

```http
GET /api/documents/:docId/versions
```

Postman or Thunder Client example:

```text
Method: GET
URL: http://localhost:5000/api/documents/DOC-MABC123-XYZ789/versions
```

Returns all uploaded versions sorted by `versionNumber` ascending.

### 5. Revoke Document

```http
POST /api/documents/:docId/revoke
```

Body type: `application/json`

Postman or Thunder Client example:

```text
Method: POST
URL: http://localhost:5000/api/documents/DOC-MABC123-XYZ789/revoke
Headers:
Content-Type: application/json
```

```json
{
  "reason": "Incorrect marks printed",
  "revokedBy": "Admin Office"
}
```

Purpose:

- Creates a revocation record
- Updates document status to `REVOKED`
- Prevents duplicate revocation if the document is already revoked
- Calls `DocumentRegistry.revokeDocument` if blockchain is configured
- Stores blockchain transaction hash in the revocation record if the call succeeds

### 6. Verify Document

```http
POST /api/documents/verify
```

Body type: `multipart/form-data`

Fields:

- `docId`
- `file` PDF only

Postman or Thunder Client example:

```text
Method: POST
URL: http://localhost:5000/api/documents/verify
Body: form-data
docId: DOC-MABC123-XYZ789
file: select certificate-to-check.pdf
```

Possible verification statuses:

- `INVALID_DOCUMENT_ID`
- `TAMPERED_OR_UNKNOWN`
- `VALID_LATEST_VERSION`
- `VALID_OLD_VERSION`
- `REVOKED`

Important behavior:

- Verification uploads are temporary.
- The uploaded verification file is deleted from local storage after its SHA-256 hash is calculated.
- The hash is compared against all stored versions for the submitted `docId`.
- MongoDB verification remains primary.
- If blockchain is configured, the response also includes `blockchainVerification`.

### 7. Blockchain Status

```http
GET /api/documents/blockchain/status
```

Postman or Thunder Client example:

```text
Method: GET
URL: http://localhost:5000/api/documents/blockchain/status
```

Returns:

- whether RPC is reachable
- whether contract address is configured
- whether all blockchain environment variables are configured
- network name and chain id if available

## Blockchain Integration Behavior

MongoDB remains the main application database. Blockchain is used as an integrity proof layer.

If blockchain is configured and available:

- Upload Document stores version hash on-chain.
- Upload New Version stores the new version hash on-chain.
- Revoke Document stores revocation proof on-chain.
- Verify Document includes both MongoDB result and optional blockchain verification result.

If blockchain is not configured or the local node is not running:

- Backend still runs.
- MongoDB upload/version/revoke still works.
- Version or revocation `blockchainStatus` becomes `NOT_CONFIGURED` or `FAILED`.
- API responses include the blockchain result without exposing private keys.

## Full Local Run With Blockchain

Terminal 1: start local Hardhat node

```bash
cd blockchain
npx hardhat node
```

Terminal 2: deploy smart contract

```bash
cd blockchain
npm run deploy
```

Copy the deployed `DocumentRegistry` contract address.

Terminal 3: configure and run backend

```bash
cd backend
npm install
npm run dev
```

Backend `.env` example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_local_hardhat_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
```

Use one of the local Hardhat private keys printed in Terminal 1. Do not commit the real `.env` file.

Terminal 4: run frontend

```bash
cd frontend
npm install
npm run dev
```

## Postman Testing Order

1. Use `POST /api/documents/upload` with a PDF.
2. Copy the returned `docId`.
3. Use `POST /api/documents/verify` with the same PDF and copied `docId`; expected status is `VALID_LATEST_VERSION`.
4. Use `POST /api/documents/:docId/versions` with the same PDF; expected error is `New version file is identical to the latest version`.
5. Use `POST /api/documents/:docId/versions` with a different corrected PDF; expected status is success and version number increases.
6. Use `POST /api/documents/verify` with the first PDF; expected status is `VALID_OLD_VERSION`.
7. Use `POST /api/documents/verify` with the corrected PDF; expected status is `VALID_LATEST_VERSION`.
8. Use `GET /api/documents/:docId/versions` to see version history.
9. Use `POST /api/documents/:docId/revoke`.
10. Use `POST /api/documents/:docId/revoke` again; expected error is `Document is already revoked`.
11. Verify any matching old or latest PDF again; expected status is `REVOKED`.
12. Use `GET /api/documents/blockchain/status` to check local Hardhat connectivity.

## Example Error Response

```json
{
  "success": false,
  "message": "Document not found",
  "data": {}
}
```

## Notes

- Files are stored locally in `backend/uploads/` for Module 1.
- Verification uploads are not stored permanently.
- `filePath` is kept generic so Cloudinary URLs can replace local paths later.
- `blockchainTxHash` and `blockchainStatus` are updated when blockchain integration is configured.
- No authentication is included in Module 1 to keep the foundation simple and explainable.
