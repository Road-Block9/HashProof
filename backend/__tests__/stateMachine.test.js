const { isValidTransition, transition } = require("../src/utils/stateMachine");

describe("State Machine", () => {
  describe("isValidTransition", () => {
    it("should return true for valid transitions", () => {
      expect(isValidTransition("Draft", "Issued")).toBe(true);
      expect(isValidTransition("Issued", "Verified")).toBe(true);
      expect(isValidTransition("Issued", "Superseded")).toBe(true);
      expect(isValidTransition("Issued", "Revoked")).toBe(true);
      expect(isValidTransition("Verified", "Superseded")).toBe(true);
      expect(isValidTransition("Verified", "Revoked")).toBe(true);
      expect(isValidTransition("Superseded", "Revoked")).toBe(true);
    });

    it("should return false for invalid transitions", () => {
      expect(isValidTransition("Draft", "Revoked")).toBe(false);
      expect(isValidTransition("Draft", "Superseded")).toBe(false);
      expect(isValidTransition("Superseded", "Draft")).toBe(false);
      expect(isValidTransition("Revoked", "Verified")).toBe(false);
      expect(isValidTransition("Revoked", "Issued")).toBe(false);
    });

    it("should return false for unknown states", () => {
      expect(isValidTransition("Unknown", "Issued")).toBe(false);
      expect(isValidTransition("Issued", "Unknown")).toBe(false);
    });
  });

  describe("transition", () => {
    it("should update version state if transition is valid", () => {
      const version = { lifecycleState: "Issued" };
      const updated = transition(version, "Verified");
      expect(updated.lifecycleState).toBe("Verified");
    });

    it("should default to Issued if version has no lifecycleState", () => {
      const version = {};
      const updated = transition(version, "Verified");
      expect(updated.lifecycleState).toBe("Verified");
    });

    it("should throw error if transition is invalid", () => {
      const version = { lifecycleState: "Draft" };
      expect(() => transition(version, "Revoked")).toThrow("Invalid lifecycle transition from Draft to Revoked");
    });

    it("should not change state or throw if transitioning to same state", () => {
      const version = { lifecycleState: "Verified" };
      const updated = transition(version, "Verified");
      expect(updated.lifecycleState).toBe("Verified");
    });
  });
});
