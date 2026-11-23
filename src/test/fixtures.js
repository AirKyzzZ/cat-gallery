export const bengal = {
  id: "beng",
  name: "Bengal",
  origin: "United States",
  country_code: "US",
  breed_group: "Short-haired",
  life_span: "12 - 16",
  temperament: "Alert, Agile, Energetic, Curious",
  description: "Medium to large, muscular cat with a wild appearance.",
  history: "Developed by crossing domestic cats with Asian leopard cats.",
  alt_names: "",
  weight: { metric: "3.6 - 7" },
  height: { metric: "33-40" },
  wikipedia_url: "https://en.wikipedia.org/wiki/Bengal_cat",
  image: { id: "O3btzLlsO", url: "https://cdn2.thecatapi.com/images/O3btzLlsO.png" },
};

export const persian = {
  id: "pers",
  name: "Persian",
  origin: "Iran (Persia)",
  country_code: "IR",
  breed_group: "Long-haired",
  life_span: "14 - 15",
  temperament: "Affectionate, Loyal, Sedate, Quiet",
  description: "Long-haired breed with a round face.",
  weight: { metric: "3 - 6" },
};

export const sphynx = {
  id: "sphy",
  name: "Sphynx",
  origin: "Canada",
  country_code: "CA",
  breed_group: "Hairless",
  life_span: "12 - 14",
  temperament: "Loyal, Inquisitive, Friendly",
  description: "Hairless cat known for its warmth.",
  alt_names: "Canadian Hairless",
  weight: { metric: "3.5 - 7" },
};

export const breeds = [bengal, persian, sphynx];

export const makeImage = (id, breed = bengal) => ({
  id,
  url: `https://cdn2.thecatapi.com/images/${id}.jpg`,
  breeds: breed ? [breed] : [],
});
