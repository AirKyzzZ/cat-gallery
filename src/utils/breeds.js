const GROUP_LABELS = {
  "Short-haired": "Poil court",
  "Long-haired": "Poil long",
  "Semi-longhair": "Poil mi-long",
  "Medium-hair": "Poil mi-long",
  "Short/Long-hair": "Poil court ou long",
  "Short/Medium-hair": "Poil court à mi-long",
  "Short/Semi-long": "Poil court à mi-long",
  "Short/Semi-longhair": "Poil court à mi-long",
  Rex: "Rex (poil frisé)",
  Hairless: "Sans poil",
  "Partially hairless": "Sans poil",
  "Hairless/Short-legged": "Sans poil",
  Hybrid: "Hybride",
  Varies: "Variable",
};

export const SORT_OPTIONS = [
  { value: "name", label: "Nom (A → Z)" },
  { value: "name-desc", label: "Nom (Z → A)" },
  { value: "lifespan", label: "Longévité" },
  { value: "weight", label: "Poids" },
];

const regionNames = new Intl.DisplayNames(["fr"], { type: "region" });
const collator = new Intl.Collator("fr", { sensitivity: "base" });

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export const groupLabel = (group) => (group ? (GROUP_LABELS[group] ?? group) : "");

export function countryName(breed) {
  const code = breed.country_code?.toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) return breed.origin ?? "";
  return regionNames.of(code) ?? breed.origin ?? "";
}

export function countryFlag(code) {
  const upper = code?.toUpperCase();
  if (!upper || !/^[A-Z]{2}$/.test(upper)) return "";
  return String.fromCodePoint(...[...upper].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
}

export function parseRange(value) {
  const numbers = String(value ?? "")
    .match(/\d+(?:\.\d+)?/g)
    ?.map(Number);
  if (!numbers?.length) return null;
  return { min: numbers[0], max: numbers.at(-1) };
}

export function formatRange(value, unit) {
  const range = parseRange(value);
  if (!range) return "Non renseigné";
  const format = (n) => n.toLocaleString("fr-FR");
  if (range.min === range.max) return `${format(range.min)} ${unit}`;
  return `${format(range.min)} à ${format(range.max)} ${unit}`;
}

export const splitTemperament = (temperament) =>
  (temperament ?? "")
    .split(",")
    .map((trait) => trait.trim())
    .filter(Boolean);

export function filterBreeds(breeds, { query = "", group = "", origin = "" }) {
  const search = normalize(query.trim());
  return breeds.filter(
    (breed) =>
      (!search || normalize(`${breed.name} ${breed.alt_names ?? ""}`).includes(search)) &&
      (!group || groupLabel(breed.breed_group) === group) &&
      (!origin || breed.country_code === origin),
  );
}

const maxOf = (value) => parseRange(value)?.max ?? 0;

const COMPARATORS = {
  name: (a, b) => collator.compare(a.name, b.name),
  "name-desc": (a, b) => collator.compare(b.name, a.name),
  lifespan: (a, b) => maxOf(b.life_span) - maxOf(a.life_span) || collator.compare(a.name, b.name),
  weight: (a, b) => maxOf(b.weight?.metric) - maxOf(a.weight?.metric) || collator.compare(a.name, b.name),
};

export function sortBreeds(breeds, sort) {
  const compare = COMPARATORS[sort] ?? COMPARATORS.name;
  return breeds.toSorted(compare);
}

export function groupOptions(breeds) {
  const labels = new Set(breeds.map((breed) => groupLabel(breed.breed_group)).filter(Boolean));
  return [...labels].sort(collator.compare);
}

export function originOptions(breeds) {
  const byCode = new Map();
  for (const breed of breeds) {
    if (breed.country_code && !byCode.has(breed.country_code)) {
      byCode.set(breed.country_code, countryName(breed));
    }
  }
  return [...byCode]
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => collator.compare(a.label, b.label));
}
