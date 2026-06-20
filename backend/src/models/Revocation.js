const mongoose = require("mongoose");

const revocationSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      required: true,
      trim: true
    },
    revokedBy: {
      type: String,
      required: true,
      trim: true
    },
    revokedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    blockchainTxHash: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Revocation", revocationSchema);
