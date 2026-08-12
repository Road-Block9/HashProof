const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    documentType: {
      type: String,
      required: true,
      default: "Other",
      trim: true
    },
    issuerName: {
      type: String,
      required: true,
      trim: true
    },
    ownerName: {
      type: String,
      required: true,
      trim: true
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    currentVersion: {
      type: Number,
      required: true,
      default: 1
    },
    status: {
      type: String,
      enum: ["ACTIVE", "REVOKED"],
      default: "ACTIVE"
    },
    latestVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Version",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Document", documentSchema);
