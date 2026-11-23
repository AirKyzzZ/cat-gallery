import { describe, expect, it } from "vitest";
import { ApiError } from "../services/apiError.js";
import { describeError } from "./errors.js";

describe("describeError", () => {
  it.each([
    [401, "clé TheCatAPI est refusée"],
    [403, "clé TheCatAPI est refusée"],
    [404, "introuvable"],
    [429, "Trop de requêtes"],
    [500, "HTTP 500"],
  ])("explains an HTTP %i in plain French", (status, expected) => {
    expect(describeError(new ApiError(status, "/breeds"))).toContain(expected);
  });

  it("explains network failures", () => {
    expect(describeError(new TypeError("Failed to fetch"))).toContain("Connexion impossible");
  });

  it("never leaks unknown technical messages", () => {
    expect(describeError(new Error("undefined is not a function"))).toBe("Une erreur inattendue est survenue.");
  });
});
