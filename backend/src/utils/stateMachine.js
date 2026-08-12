const VALID_TRANSITIONS = {
  Draft: ["Issued"],
  Issued: ["Verified", "Superseded", "Revoked"],
  Verified: ["Superseded", "Revoked"],
  Superseded: ["Revoked"],
  Revoked: []
};

const isValidTransition = (fromState, toState) => {
  const allowed = VALID_TRANSITIONS[fromState];
  return allowed ? allowed.includes(toState) : false;
};

const transition = (version, toState) => {
  const fromState = version.lifecycleState || "Issued"; // Default to Issued for old records
  
  if (fromState === toState) {
    return version; // No change needed
  }

  if (!isValidTransition(fromState, toState)) {
    throw new Error(`Invalid lifecycle transition from ${fromState} to ${toState}`);
  }

  version.lifecycleState = toState;
  
  // Set timestamps
  if (toState === "Verified" && !version.verifiedAt) {
    version.verifiedAt = new Date();
  } else if (toState === "Superseded" && !version.supersededAt) {
    version.supersededAt = new Date();
  }

  return version;
};

module.exports = {
  VALID_TRANSITIONS,
  isValidTransition,
  transition
};
