# Blockchain-based Document Authentication and Integrity Verification System

This project is a final-year web application for authenticating official documents such as certificates, mark sheets, letters, and PDFs. The system generates a SHA-256 hash of each uploaded document and stores metadata for verification, version tracking, and revocation management.

The actual PDF is stored off-chain. In Module 1, files are stored locally. In later modules, storage can be moved to Cloudinary and important integrity data can be stored on blockchain.

## Main Features

- Upload official PDF documents
- Generate SHA-256 document hash
- Store document metadata in MongoDB
- Track every uploaded document version
- Revoke documents with reason and timestamp
- Verify uploaded documents as valid, tampered, revoked, old version, or latest version

## Planned Tech Stack

Frontend:

- React + Vite
- Tailwind CSS
- Axios
- React Router

Backend:

- Node.js
- Express.js
- Multer
- Mongoose
- dotenv
- CORS
- Node.js crypto module

Database:

- MongoDB Atlas or local MongoDB

File Storage:

- Local storage for Module 1
- Cloudinary planned later

Blockchain:

- Solidity
- Hardhat
- Ganache
- ethers.js
- MetaMask if needed later

## Planned Modules

### Module 1: Backend Foundation

Status: Completed

Includes:

- Express backend setup
- MongoDB connection
- Document, Version, and Revocation models
- Local PDF upload
- SHA-256 hashing
- Document upload API
- New version upload API
- Document details API
- Version history API
- Revocation API
- Verification API

### Module 2: Frontend

Status: Completed

React frontend pages:

- Upload Document
- Upload New Version
- Verify Document
- Version History
- Revoke Document
- Dashboard
- Document Details

### Module 3: Blockchain Smart Contract

Status: Completed

Solidity contract to store:

- `docId`
- `versionNumber`
- document hash
- timestamp
- revoked status
- revocation reason hash or reason reference

Implemented with Hardhat in `blockchain/`. Backend integration is planned for Module 4.

### Module 4: Backend-Blockchain Integration

Status: Completed

Backend will call the smart contract after MongoDB operations and update:

- `blockchainTxHash`
- `blockchainStatus`

MongoDB remains the primary database. Blockchain is used as an integrity proof layer through ethers.js and the local Hardhat `DocumentRegistry` contract.

### Module 5: Final Dashboard and Research Paper Support

Complete frontend verification flow, final testing, screenshots, and documentation useful for viva and research paper writing.

## Current Structure

```text
document-auth-system/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- utils/
|   |-- uploads/
|   |-- .env.example
|   |-- package.json
|   |-- README.md
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- pages/
|-- blockchain/
|   |-- contracts/
|   |-- scripts/
|   |-- test/
|-- PROJECT_CONTEXT.md
|-- README.md
```

## Run Module 1

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` before running:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

## Run Module 2

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` before running:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Run Module 3

```bash
cd blockchain
npm install
npm run compile
npm test
```
