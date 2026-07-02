const fs = require("fs/promises");
const { cloudinary, configureCloudinary } = require("../config/cloudinary");

const deleteLocalFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Failed to delete local file:", error.message);
  }
};

const storeUploadedPdf = async (file) => {
  if (!file || !file.path) {
    return {
      storageProvider: "LOCAL",
      filePath: file?.path || "",
      secureUrl: null,
      cloudinaryPublicId: null,
      storageMessage: "No file path available for storage"
    };
  }

  const cloudinaryStatus = configureCloudinary();

  if (!cloudinaryStatus.configured) {
    const skipReason = cloudinaryStatus.disabledReason || `missing ${cloudinaryStatus.missingFields.join(", ")}`;

    console.log(`Cloudinary upload skipped: ${skipReason}`);

    return {
      storageProvider: "LOCAL",
      filePath: file.path,
      secureUrl: null,
      cloudinaryPublicId: null,
      storageMessage: "Cloudinary is not configured; file stored locally"
    };
  }

  try {
    console.log(`Uploading PDF to Cloudinary cloud: ${cloudinaryStatus.cloudName}`);

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      folder: "hashproof/documents",
      use_filename: true,
      unique_filename: true
    });

    if (!uploadResult.secure_url) {
      throw new Error("Cloudinary upload did not return secure_url");
    }

    await deleteLocalFile(file.path);

    return {
      storageProvider: "CLOUDINARY",
      filePath: uploadResult.secure_url,
      secureUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      storageMessage: "File uploaded to Cloudinary"
    };
  } catch (error) {
    const cleanReason = error?.message || "Unknown Cloudinary error";
    const httpCode = error?.http_code ? ` (HTTP ${error.http_code})` : "";

    console.error(`Cloudinary upload failed${httpCode}; using local file storage: ${cleanReason}`);

    return {
      storageProvider: "LOCAL",
      filePath: file.path,
      secureUrl: null,
      cloudinaryPublicId: null,
      storageMessage: `Cloudinary upload failed; file stored locally: ${cleanReason}`
    };
  }
};

module.exports = {
  storeUploadedPdf,
  deleteLocalFile
};
