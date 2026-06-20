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
- Sets blockchain status as `PENDING`
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
- Keeps blockchain transaction hash as `null` for future integration

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
- `blockchainTxHash` and `blockchainStatus` are placeholders for future blockchain integration.
- No authentication is included in Module 1 to keep the foundation simple and explainable.
