# Project Context

## 1. Project Overview

Project Name: Blockchain-based Document Authentication and Integrity Verification System with Version Tracking and Revocation Management

Goal: Build a web-based system where an institution/admin can upload official PDF documents, generate SHA-256 hashes, store metadata, track versions, revoke documents with reason and timestamp, and allow public verification of uploaded documents.

The project is intentionally simple and clean for a college final-year project, viva explanation, and research paper writing.

## 2. Selected Tech Stack

Frontend planned:

- React + Vite
- Tailwind CSS
- Axios
- React Router

Backend implemented in Module 1:

- Node.js
- Express.js
- Multer
- Mongoose
- dotenv
- CORS
- Node.js built-in crypto module
- nodemon

Database:

- MongoDB Atlas or local MongoDB

File storage:

- Module 1 uses local storage in `backend/uploads/`
- Cloudinary planned later

Blockchain planned:

- Solidity
- Hardhat
- Ganache
- ethers.js
- MetaMask if needed later

## 3. Current Folder Structure

```text
document-auth-system/
|-- backend/
|   |-- src/
|   |   |-- blockchain/
|   |   |   |-- DocumentRegistryABI.json
|   |   |-- config/
|   |   |   |-- blockchain.js
|   |   |   |-- db.js
|   |   |-- controllers/
|   |   |   |-- documentController.js
|   |   |-- middleware/
|   |   |   |-- uploadMiddleware.js
|   |   |-- models/
|   |   |   |-- Document.js
|   |   |   |-- Version.js
|   |   |   |-- Revocation.js
|   |   |-- routes/
|   |   |   |-- documentRoutes.js
|   |   |-- services/
|   |   |   |-- blockchainService.js
|   |   |-- utils/
|   |   |   |-- hashFile.js
|   |   |-- app.js
|   |   |-- server.js
|   |-- uploads/
|   |   |-- .gitkeep
|   |-- .env.example
|   |-- package.json
|   |-- pnpm-lock.yaml
|   |-- README.md
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |   |-- documentApi.js
|   |   |-- components/
|   |   |   |-- CopyButton.jsx
|   |   |   |-- FormField.jsx
|   |   |   |-- Layout.jsx
|   |   |   |-- Loader.jsx
|   |   |   |-- LoadingButton.jsx
|   |   |   |-- Navbar.jsx
|   |   |   |-- StatusMessage.jsx
|   |   |-- pages/
|   |   |   |-- DashboardPage.jsx
|   |   |   |-- DocumentDetailsPage.jsx
|   |   |   |-- RevokeDocumentPage.jsx
|   |   |   |-- UploadDocumentPage.jsx
|   |   |   |-- UploadVersionPage.jsx
|   |   |   |-- VerifyDocumentPage.jsx
|   |   |   |-- VersionHistoryPage.jsx
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- styles.css
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- pnpm-lock.yaml
|   |-- pnpm-workspace.yaml
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   |-- vite.config.js
|   |-- README.md
|-- blockchain/
|   |-- contracts/
|   |   |-- DocumentRegistry.sol
|   |-- scripts/
|   |   |-- deploy.js
|   |-- test/
|   |   |-- DocumentRegistry.test.js
|   |-- hardhat.config.js
|   |-- package.json
|   |-- pnpm-lock.yaml
|   |-- pnpm-workspace.yaml
|   |-- README.md
|-- .gitignore
|-- PROJECT_CONTEXT.md
|-- README.md
```

## 4. Completed Modules

### Module 1: Backend Foundation + MongoDB Models + Basic APIs

Completed on: 2026-06-20

Implemented:

- Node.js + Express backend scaffold
- MongoDB connection using Mongoose
- Local PDF upload using Multer
- PDF-only validation
- 10 MB upload size limit
- SHA-256 file hashing utility
- Document model
- Version model
- Revocation model
- Upload new document API
- Upload new version API
- Get document details API
- Get version history API
- Revoke document API
- Verify document by uploaded file API
- Backend README
- Root README
- Root `.gitignore`

### Backend Quality Pass

Completed on: 2026-06-20

Implemented:

- Verification uploads are deleted after SHA-256 hash calculation.
- Duplicate revocation is prevented when `Document.status` is already `REVOKED`.
- Uploading a new version with the same hash as the latest version is rejected.
- Rejected new-version uploads are deleted if the document is missing, revoked, or identical to the latest version.
- All API responses now follow `{ success, message, data }`.
- Backend README includes Postman or Thunder Client examples for all routes.
- Local DNS fallback added before MongoDB connection for MongoDB Atlas SRV resolution issues on some networks.

### Module 2: React Frontend

Completed on: 2026-06-20

Implemented:

- React + Vite frontend scaffold in `frontend/`.
- Tailwind CSS setup.
- Axios API helper in `src/api/documentApi.js`.
- React Router routes in `src/App.jsx`.
- Shared layout/navigation/status/loading/copy/form components.
- Dashboard/Home page.
- Upload Document page connected to `POST /api/documents/upload`.
- Upload New Version page connected to `POST /api/documents/:docId/versions`.
- Verify Document page connected to `POST /api/documents/verify`.
- Version History page connected to `GET /api/documents/:docId/versions`.
- Revoke Document page connected to `POST /api/documents/:docId/revoke`.
- Document Details page connected to `GET /api/documents/:docId`.
- Frontend README with setup, routes, and manual testing flow.
- Frontend dependencies were installed in this workspace using bundled `pnpm`.
- `frontend/pnpm-workspace.yaml` allows the required `esbuild` build script for Vite in this pnpm version.
- Production build was verified successfully with `pnpm run build`.

### Module 3: Blockchain Smart Contract

Completed on: 2026-06-20

Implemented:

- Hardhat project scaffold in `blockchain/`.
- Solidity contract `DocumentRegistry`.
- Document hash registration on-chain.
- Version tracking for multiple versions per `docId`.
- Revocation management with reason, revoker address, and timestamp.
- Public blockchain verification by `docId` and `fileHash`.
- Contract rejects new version registration after revocation.
- Deployment script in `scripts/deploy.js`.
- Test suite in `test/DocumentRegistry.test.js`.
- Blockchain README with install, compile, test, deploy, and function explanations.
- Contract compilation verified successfully.
- Hardhat test suite verified successfully with 8 passing tests.
- `blockchain/pnpm-workspace.yaml` allows required native crypto helper builds for `keccak` and `secp256k1`.

Important: Module 3 created the smart contract only. Module 4 now connects the backend to this contract using ethers.js.

### Module 4: Backend + Blockchain Integration

Completed on: 2026-06-20

Implemented:

- Added ethers.js to backend dependencies.
- Added `backend/src/config/blockchain.js`.
- Added `backend/src/services/blockchainService.js`.
- Added local ABI copy at `backend/src/blockchain/DocumentRegistryABI.json`.
- Added backend environment variables for local Hardhat integration.
- Upload Document API registers version 1 on-chain when blockchain is configured.
- Upload New Version API registers the new version on-chain when blockchain is configured.
- Revoke Document API calls the smart contract revoke function when blockchain is configured.
- Version records store `blockchainTxHash` and `blockchainStatus`.
- Revocation records store `blockchainTxHash` and `blockchainStatus`.
- Verify Document API keeps MongoDB verification as primary and includes optional `blockchainVerification`.
- Added `GET /api/documents/blockchain/status` helper route.
- Blockchain node/config errors are handled safely without crashing the backend.

Important: MongoDB remains the primary application database. Blockchain is used as an integrity proof layer.

## 5. Pending Modules

Module 5: Final verification dashboard and research paper support

- UI polish
- Testing screenshots
- Documentation for report and viva

## 6. API Routes Created

Base route:

```text
/api/documents
```

Routes:

```text
POST /api/documents/upload
POST /api/documents/:docId/versions
GET  /api/documents/:docId
GET  /api/documents/:docId/versions
POST /api/documents/:docId/revoke
POST /api/documents/verify
GET  /api/documents/blockchain/status
```

Health route:

```text
GET /
```

## 7. Database Models Created

### Document

Purpose: Stores the main identity and current state of a document.

Fields:

- `docId`: unique string
- `title`: string
- `description`: string
- `issuerName`: string
- `ownerName`: string
- `ownerEmail`: string
- `currentVersion`: number
- `status`: enum `ACTIVE`, `REVOKED`
- `latestVersionId`: ObjectId reference to Version
- timestamps

### Version

Purpose: Stores every uploaded version of a document.

Fields:

- `document`: ObjectId reference to Document
- `docId`: string
- `versionNumber`: number
- `fileName`: string
- `filePath`: string
- `fileSize`: number
- `mimeType`: string
- `hash`: SHA-256 hash string
- `blockchainTxHash`: optional string, currently null
- `blockchainStatus`: enum `PENDING`, `STORED`, `FAILED`, `NOT_CONFIGURED`, default `PENDING`
- timestamps

### Revocation

Purpose: Stores revocation details when a document is revoked.

Fields:

- `document`: ObjectId reference to Document
- `docId`: string
- `reason`: string
- `revokedBy`: string
- `revokedAt`: Date
- `blockchainTxHash`: optional string, currently null
- `blockchainStatus`: enum `PENDING`, `STORED`, `FAILED`, `NOT_CONFIGURED`, default `PENDING`
- timestamps

## 8. Environment Variables Used

Defined in `backend/.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_local_hardhat_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
```

Defined in `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Actual `.env` file is not created with secrets and should not be committed.

## 9. Important Implementation Decisions

- Local storage is used in Module 1 for uploaded PDFs.
- `filePath` is kept generic so it can later store a Cloudinary secure URL.
- Blockchain fields are used by backend-blockchain integration:
  - `blockchainTxHash`
  - `blockchainStatus`
- Version tracking is implemented through a separate `Version` collection.
- Revocation details are implemented through a separate `Revocation` collection.
- A revoked document cannot receive new versions.
- Verification compares the uploaded PDF hash against all versions of the provided `docId`.
- Verification uploads are temporary and are deleted after hashing.
- Verification returns `VALID_OLD_VERSION` when the uploaded file matches an earlier active version.
- Verification returns `REVOKED` when the hash matches any version but the document has been revoked.
- New version uploads are rejected if their SHA-256 hash is the same as the latest version hash.
- Duplicate revocation requests return an error and do not create another `Revocation` record.
- Public document IDs use the generated `docId` format, such as `DOC-MABC123-XYZ789`; MongoDB `_id` is not used as the public verification ID.
- Every API response uses the same envelope: `{ success, message, data }`.
- Backend sets Node DNS servers to `8.8.8.8` and `1.1.1.1` before `mongoose.connect` to handle local MongoDB Atlas SRV resolution issues on some networks.
- Backend uses `dns.setDefaultResultOrder("ipv4first")` when supported by the local Node.js version.
- No authentication is included in Module 1 to keep the implementation simple.
- Frontend reads backend base URL from `VITE_API_BASE_URL`.
- Frontend does not add authentication, blockchain integration, or fake blockchain data.
- Frontend displays backend `blockchainStatus` exactly as returned by the backend.
- Frontend keeps API calls in `src/api/documentApi.js` so pages remain simple.
- Smart contract keeps strings for `docId` and `fileHash` to make the project easy to explain.
- Smart contract allows any address to register or revoke for now; admin authentication is future scope.
- Smart contract stores version details in a mapping from `docId` to an array of versions.
- Smart contract stores revocation details in a mapping from `docId` to revocation data.
- Backend now integrates with the local Hardhat `DocumentRegistry` smart contract through ethers.js.
- The backend uses a copied ABI JSON file rather than reading Hardhat artifacts at runtime, which keeps deployment explanation simple.
- If `CONTRACT_ADDRESS`, `PRIVATE_KEY`, or `BLOCKCHAIN_RPC_URL` is missing, blockchain calls are skipped safely and marked `NOT_CONFIGURED`.
- If the blockchain node is down or a transaction fails, MongoDB operations still complete and blockchain status is marked `FAILED`.
- Private keys are read only from environment variables and are never returned in API responses.

## 10. Known Issues or Bugs

- Dependencies may still need to be installed with `npm install` inside `backend/`.
- Dependencies were installed in this workspace using bundled `pnpm`, which created `backend/pnpm-lock.yaml` and `backend/node_modules/`. On a normal system with Node.js installed, `npm install` can also be used from `backend/`.
- Frontend dependencies may need to be installed with `npm install` inside `frontend/`.
- Frontend build output is ignored via `frontend/dist/`.
- Blockchain build output is ignored via `blockchain/artifacts/` and `blockchain/cache/`.
- Blockchain dependencies may need to be installed with `npm install` inside `blockchain/`.
- A valid MongoDB URI must be added in `backend/.env` before running the server.
- To enable blockchain integration, `BLOCKCHAIN_RPC_URL`, `PRIVATE_KEY`, and `CONTRACT_ADDRESS` must be added in `backend/.env`.
- A valid frontend API base URL must be added in `frontend/.env`.
- There is no authentication or role-based access yet.
- Frontend does not yet display all Module 4 blockchain details in a dedicated UI.
- There is no Cloudinary integration yet.

## 11. Next Recommended Task

Next recommended task: Manually test full upload/version/revoke flow with a local Hardhat node, then improve frontend display for blockchain transaction details if needed.
