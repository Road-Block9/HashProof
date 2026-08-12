const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/documents';

const createDummyPdf = (filePath) => {
  fs.writeFileSync(filePath, `%PDF-1.4\n1 0 obj\n<<\n/Title (Dummy PDF ${Date.now()})\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF`);
};

const measureTime = async (label, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)} ms`);
  return { time: end - start, result };
};

const runEvaluation = async () => {
  console.log("==========================================");
  console.log("   HASHPROOF PERFORMANCE EVALUATION");
  console.log("==========================================\n");

  const pdfPath = path.join(__dirname, 'dummy_eval.pdf');
  createDummyPdf(pdfPath);

  try {
    let docId = null;
    let selectiveProof = null;

    // 1. Upload Document
    const uploadRes = await measureTime("1. Traditional Upload & Blockchain Registration", async () => {
      const form = new FormData();
      form.append('file', fs.createReadStream(pdfPath));
      form.append('title', 'Research Doc');
      form.append('description', 'Performance eval document');
      form.append('issuerName', 'University Labs');
      form.append('ownerName', 'Dr. Researcher');
      form.append('ownerEmail', 'research@univ.edu');
      form.append('documentType', 'Report');

      const response = await axios.post(`${API_URL}/upload`, form, {
        headers: form.getHeaders()
      });
      return response.data;
    });

    if (uploadRes.result.success) {
      docId = uploadRes.result.data.document.docId;
    } else {
      throw new Error(`Upload failed: ${JSON.stringify(uploadRes.result)}`);
    }

    // 2. Traditional Verification
    await measureTime("2. Traditional Verification (Full Document)", async () => {
      const form = new FormData();
      form.append('file', fs.createReadStream(pdfPath));
      const response = await axios.post(`${API_URL}/verify`, form, {
        headers: form.getHeaders()
      });
      return response.data;
    });

    // 3. Merkle Proof Generation
    const genProofRes = await measureTime("3. Merkle Proof Generation (Selective Disclosure)", async () => {
      const response = await axios.post(`${API_URL}/${docId}/proof`, {
        fieldsToDisclose: ['title', 'issuerName', 'ownerName'],
        versionNumber: 1
      });
      return response.data;
    });
    
    selectiveProof = genProofRes.result.data;

    // 4. Selective Proof Verification
    await measureTime("4. Selective Proof Verification (No Document Access)", async () => {
      const response = await axios.post(`${API_URL}/verify-selective`, selectiveProof);
      return response.data;
    });

    // 5. Historical Verification
    await measureTime("5. Historical Validity Verification", async () => {
      const response = await axios.post(`${API_URL}/${docId}/historical-verify`, {
        targetDate: new Date().toISOString(),
        versionNumber: 1
      });
      return response.data;
    });

    // 6. Audit Log Retrieval
    await measureTime("6. Immutable Audit Log Retrieval", async () => {
      const response = await axios.get(`${API_URL}/${docId}/audit`);
      return response.data;
    });

    console.log("\n==========================================");
    console.log("   EVALUATION COMPLETE");
    console.log("==========================================");
    
  } catch (err) {
    if (err.response) {
      console.error("Evaluation API Error:", err.response.data);
    } else {
      console.error("Evaluation Error:", err.message);
    }
  } finally {
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
  }
};

runEvaluation();
