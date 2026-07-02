require("dotenv").config();

const { v2: cloudinary } = require("cloudinary");

const getEnvValue = (key) => (process.env[key] || "").trim();

const isRealValue = (value) => Boolean(value && !value.startsWith("your_"));

const getCloudinaryConfigStatus = () => {
  if (process.env.NODE_ENV === "test" && process.env.CLOUDINARY_ENABLE_IN_TESTS !== "true") {
    return {
      configured: false,
      missingFields: [],
      cloudName: null,
      disabledReason: "Cloudinary disabled during tests"
    };
  }

  const cloudName = getEnvValue("CLOUDINARY_CLOUD_NAME");
  const apiKey = getEnvValue("CLOUDINARY_API_KEY");
  const apiSecret = getEnvValue("CLOUDINARY_API_SECRET");

  const missingFields = [];

  if (!isRealValue(cloudName)) {
    missingFields.push("CLOUDINARY_CLOUD_NAME");
  }

  if (!isRealValue(apiKey)) {
    missingFields.push("CLOUDINARY_API_KEY");
  }

  if (!isRealValue(apiSecret)) {
    missingFields.push("CLOUDINARY_API_SECRET");
  }

  return {
    configured: missingFields.length === 0,
    missingFields,
    cloudName: isRealValue(cloudName) ? cloudName : null
  };
};

const configureCloudinary = () => {
  const status = getCloudinaryConfigStatus();

  if (!status.configured) {
    return status;
  }

  cloudinary.config({
    cloud_name: getEnvValue("CLOUDINARY_CLOUD_NAME"),
    api_key: getEnvValue("CLOUDINARY_API_KEY"),
    api_secret: getEnvValue("CLOUDINARY_API_SECRET"),
    secure: true
  });

  return status;
};

const isCloudinaryConfigured = () => getCloudinaryConfigStatus().configured;

module.exports = {
  cloudinary,
  configureCloudinary,
  getCloudinaryConfigStatus,
  isCloudinaryConfigured
};
