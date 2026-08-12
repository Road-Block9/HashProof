import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/documents`
});

const createError = (error) => {
  const err = new Error(error.response?.data?.message || error.message || "Something went wrong");
  if (error.response?.data?.errors) {
    err.validationErrors = error.response.data.errors;
  }
  return err;
};

export const uploadDocument = async (formData) => {
  try {
    const response = await apiClient.post("/upload", formData);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const uploadNewVersion = async (docId, formData) => {
  try {
    const response = await apiClient.post(`/${docId}/versions`, formData);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const verifyDocument = async (formData) => {
  try {
    const response = await apiClient.post("/verify", formData);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const getVersionHistory = async (docId) => {
  try {
    const response = await apiClient.get(`/${docId}/versions`);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const revokeDocument = async (docId, payload) => {
  try {
    const response = await apiClient.post(`/${docId}/revoke`, payload);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const getDocumentDetails = async (docId) => {
  try {
    const response = await apiClient.get(`/${docId}`);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const getBlockchainStatus = async () => {
  try {
    const response = await apiClient.get("/blockchain/status");
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const generateSelectiveProof = async (docId, payload) => {
  try {
    const response = await apiClient.post(`/${docId}/proof`, payload);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const verifySelectiveProof = async (payload) => {
  try {
    const response = await apiClient.post("/verify-selective", payload);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const verifyHistoricalDocument = async (docId, payload) => {
  try {
    const response = await apiClient.post(`/${docId}/historical-verify`, payload);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};

export const getAuditLogs = async (docId) => {
  try {
    const response = await apiClient.get(`/${docId}/audit`);
    return response.data;
  } catch (error) {
    throw createError(error);
  }
};
