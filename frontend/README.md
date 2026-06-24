# Frontend - Document Authentication System

This is Module 2 of the Blockchain-based Document Authentication and Integrity Verification System. The frontend is branded as HASHPROOF and connects to the existing Express backend APIs.

## Tech Used

- React + Vite
- Tailwind CSS
- Axios
- React Router
- lucide-react for simple icons

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in `frontend/` using `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

3. Run the frontend:

```bash
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

## Backend Dependency

The backend must be running before testing API-connected pages.

Backend default URL:

```text
http://localhost:5000
```

Backend API base route:

```text
/api/documents
```

## Frontend Routes

```text
/                 Dashboard/Home
/upload           Upload Document
/upload-version   Upload New Version
/verify           Verify Document
/versions         Version History
/revoke           Revoke Document
/details          Document Details
/blockchain-status Blockchain Status
```

## API Connections

| Page | Backend API |
| --- | --- |
| Upload Document | `POST /api/documents/upload` |
| Upload New Version | `POST /api/documents/:docId/versions` |
| Verify Document | `POST /api/documents/verify` |
| Version History | `GET /api/documents/:docId/versions` |
| Revoke Document | `POST /api/documents/:docId/revoke` |
| Document Details | `GET /api/documents/:docId` |
| Blockchain Status | `GET /api/documents/blockchain/status` |

## Manual Testing Flow

1. Start backend with valid MongoDB connection.
2. Start frontend.
3. Upload a new PDF document.
4. Copy the generated `docId`.
5. Verify the same PDF and confirm `VALID_LATEST_VERSION`.
6. Upload a different PDF as a new version.
7. Verify the old PDF and confirm `VALID_OLD_VERSION`.
8. Check version history.
9. Open document details.
10. Revoke the document.
11. Verify any matching version again and confirm `REVOKED`.

## Notes

- No authentication is included in Module 2.
- No blockchain integration is included in Module 2.
- No fake blockchain data is added. Backend `blockchainStatus`, `blockchainTxHash`, and `blockchainVerification` values are displayed exactly as returned.
- The UI is branded as HASHPROOF and kept demo-ready for final-year project presentation.
