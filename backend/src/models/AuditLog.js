const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true,
      index: true
    },
    versionNumber: {
      type: Number
    },
    eventType: {
      type: String,
      required: true,
      index: true
    },
    previousState: {
      type: String
    },
    newState: {
      type: String
    },
    performedBy: {
      type: String,
      default: "System"
    },
    blockchainTxHash: {
      type: String
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Immutability Hooks
const throwImmutableError = function (next) {
  next(new Error("Audit logs are immutable and cannot be modified or deleted."));
};

auditLogSchema.pre("findOneAndUpdate", throwImmutableError);
auditLogSchema.pre("updateOne", throwImmutableError);
auditLogSchema.pre("updateMany", throwImmutableError);
auditLogSchema.pre("remove", throwImmutableError);
auditLogSchema.pre("deleteOne", throwImmutableError);
auditLogSchema.pre("deleteMany", throwImmutableError);
auditLogSchema.pre("findOneAndDelete", throwImmutableError);
auditLogSchema.pre("findOneAndRemove", throwImmutableError);
auditLogSchema.pre("findOneAndReplace", throwImmutableError);

module.exports = mongoose.model("AuditLog", auditLogSchema);
