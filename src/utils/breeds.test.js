import { describe, expect, it } from "vitest";
import { bengal, breeds, persian, sphynx } from "../test/fixtures.js";
import {
  countryFlag,
  countryName,
  filterBreeds,
  formatRange,
  groupLabel,
  groupOptions,
  originOptions,
  parseRange,
  sortBreeds,
  splitTemperament,
} from "./breeds.js";

const names = (list) => list.map((breed) => breed.name);

describe("filterBreeds", () => {
  it("returns every breed without filters", () => {
    expect(filterBreeds(breeds, {})).toEqual(breeds);
  });

  it("matches the name and alternative names, ignoring case and accents", () => {
    expect(names(filterBreeds(breeds, { query: "BENG" }))).toEqual(["Bengal"]);
    expect(names(filterBreeds(breeds, { query: "canadian" }))).toEqual(["Sphynx"]);
    expect(names(filterBreeds([{ ...persian, name: "Persé" }], { query: "perse" }))).toEqual(["Persé"]);
  });

  it("combines the coat group and origin filters", () => {
    expect(names(filterBreeds(breeds, { group: "Sans poil" }))).toEqual(["Sphynx"]);
    expect(names(filterBreeds(breeds, { origin: "IR" }))).toEqual(["Persian"]);
    expect(filterBreeds(breeds, { group: "Poil long", origin: "US" })).toEqual([]);
  });
});

describe("sortBreeds", () => {
  it("sorts by name in both directions without mutating the input", () => {
    const input = [sphynx, bengal, persian];
    expect(names(sortBreeds(input, "name"))).toEqual(["Bengal", "Persian", "Sphynx"]);
    expect(names(sortBreeds(input, "name-desc"))).toEqual(["Sphynx", "Persian", "Bengal"]);
    expect(names(input)).toEqual(["Sphynx", "Bengal", "Persian"]);
  });

  it("puts the longest-lived and heaviest breeds first", () => {
    expect(names(sortBreeds(breeds, "lifespan"))).toEqual(["Bengal", "Persian", "Sphynx"]);
    expect(names(sortBreeds(breeds, "weight"))).toEqual(["Bengal", "Sphynx", "Persian"]);
  });

  it("falls back to alphabetical order for an unknown sort", () => {
    expect(names(sortBreeds([sphynx, bengal], "nope"))).toEqual(["Bengal", "Sphynx"]);
  });
});

describe("ranges", () => {
  it("parses API ranges written in several formats", () => {
    expect(parseRange("12 - 16")).toEqual({ min: 12, max: 16 });
    expect(parseRange("3.6-7")).toEqual({ min: 3.6, max: 7 });
    expect(parseRange("10")).toEqual({ min: 10, max: 10 });
    expect(parseRange(undefined)).toBeNull();
  });

  it("formats ranges for French readers", () => {
    expect(formatRange("3.6 - 7", "kg")).toBe("3,6 à 7 kg");
    expect(formatRange("15", "ans")).toBe("15 ans");
    expect(formatRange("", "cm")).toBe("Non renseigné");
  });
});

describe("labels", () => {
  it("translates coat groups and keeps unknown ones as is", () => {
    expect(groupLabel("Short-haired")).toBe("Poil court");
    expect(groupLabel("Fluffy")).toBe("Fluffy");
    expect(groupLabel(null)).toBe("");
  });

  it("builds a flag emoji and a French country name from the ISO code", () => {
    expect(countryFlag("fr")).toBe("🇫🇷");
    expect(countryFlag("XYZ")).toBe("");
    expect(countryName(bengal)).toBe("États-Unis");
    expect(countryName({ origin: "Somewhere" })).toBe("Somewhere");
  });

  it("splits the temperament into trimmed traits", () => {
    expect(splitTemperament("Alert,  Agile ,Curious")).toEqual(["Alert", "Agile", "Curious"]);
    expect(splitTemperament(undefined)).toEqual([]);
  });

  it("lists unique filter options sorted in French", () => {
    expect(groupOptions(breeds)).toEqual(["Poil court", "Poil long", "Sans poil"]);
    expect(originOptions(breeds)).toEqual([
      { code: "CA", label: "Canada" },
      { code: "US", label: "États-Unis" },
      { code: "IR", label: "Iran" },
    ]);
  });
});
