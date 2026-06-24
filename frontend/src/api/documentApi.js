import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/documents`
});

const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || "Something went wrong";
};

export const uploadDocument = async (formData) => {
  try {
    const response = await apiClient.post("/upload", formData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const uploadNewVersion = async (docId, formData) => {
  try {
    const response = await apiClient.post(`/${docId}/versions`, formData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const verifyDocument = async (formData) => {
  try {
    const response = await apiClient.post("/verify", formData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getVersionHistory = async (docId) => {
  try {
    const response = await apiClient.get(`/${docId}/versions`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const revokeDocument = async (docId, payload) => {
  try {
    const response = await apiClient.post(`/${docId}/revoke`, payload);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getDocumentDetails = async (docId) => {
  try {
    const response = await apiClient.get(`/${docId}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getBlockchainStatus = async () => {
  try {
    const response = await apiClient.get("/blockchain/status");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
