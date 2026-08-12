const VALID_DOCUMENT_TYPES = ['Certificate', 'Transcript', 'Contract', 'ID', 'Report', 'Other'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
};

const validateRequiredFields = (fields, data, errors) => {
  fields.forEach(field => {
    if (!data[field]) {
      // Create readable labels (e.g., ownerEmail -> Owner Email)
      const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      errors.push(`${label} is required`);
    }
  });
};

const validateNewDocument = (data) => {
  const errors = [];
  const normalizedData = {};

  const fields = ['title', 'description', 'issuerName', 'ownerName', 'ownerEmail', 'documentType'];
  fields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      normalizedData[field] = normalizeString(data[field]);
    }
  });

  validateRequiredFields(['title', 'issuerName', 'ownerName', 'ownerEmail', 'documentType'], normalizedData, errors);

  if (normalizedData.ownerEmail && !EMAIL_REGEX.test(normalizedData.ownerEmail)) {
    errors.push('Owner Email is invalid');
  }

  if (normalizedData.documentType && !VALID_DOCUMENT_TYPES.includes(normalizedData.documentType)) {
    errors.push(`Document Type must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}`);
  }

  if (normalizedData.title && normalizedData.title.length > 150) errors.push('Title exceeds maximum length of 150 characters');
  if (normalizedData.issuerName && normalizedData.issuerName.length > 150) errors.push('Issuer Name exceeds maximum length of 150 characters');
  if (normalizedData.ownerName && normalizedData.ownerName.length > 150) errors.push('Owner Name exceeds maximum length of 150 characters');
  if (normalizedData.description && normalizedData.description.length > 1000) errors.push('Description exceeds maximum length of 1000 characters');

  return { isValid: errors.length === 0, errors, normalizedData };
};

const validateNewVersion = (data, existingDocument) => {
  const errors = [];
  const normalizedData = {};

  const fields = ['title', 'description', 'ownerName', 'ownerEmail'];
  fields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      normalizedData[field] = normalizeString(data[field]);
    }
  });

  if (normalizedData.ownerName && normalizedData.ownerName !== existingDocument.ownerName) {
    errors.push('Owner Name cannot be changed in a new version');
  }
  
  if (normalizedData.ownerEmail && normalizedData.ownerEmail.toLowerCase() !== existingDocument.ownerEmail.toLowerCase()) {
    errors.push('Owner Email cannot be changed in a new version');
  }

  if (normalizedData.title && normalizedData.title.length > 150) errors.push('Title exceeds maximum length of 150 characters');
  if (normalizedData.description && normalizedData.description.length > 1000) errors.push('Description exceeds maximum length of 1000 characters');

  return { isValid: errors.length === 0, errors, normalizedData };
};

module.exports = {
  validateNewDocument,
  validateNewVersion,
  VALID_DOCUMENT_TYPES
};
