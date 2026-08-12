const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true
    },
    docId: {
      type: String,
      required: true,
      trim: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    storageProvider: {
      type: String,
      enum: ["LOCAL", "CLOUDINARY"],
      default: "LOCAL"
    },
    cloudinaryPublicId: {
      type: String,
      default: null
    },
    hash: {
      type: String,
      required: true,
      index: true
    },
    merkleRoot: {
      type: String,
      default: null
    },
    blockchainTxHash: {
      type: String,
      default: null
    },
    blockchainStatus: {
      type: String,
      enum: ["PENDING", "STORED", "FAILED", "NOT_CONFIGURED"],
      default: "PENDING"
    },
    lifecycleState: {
      type: String,
      enum: ["Draft", "Issued", "Verified", "Superseded", "Revoked"],
      default: "Issued"
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    supersededAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

versionSchema.index({ docId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model("Version", versionSchema);
