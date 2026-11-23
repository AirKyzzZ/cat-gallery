import { ApiError } from "./apiError.js";

export const BASE_URL = "https://api.thecatapi.com/v1";
const API_KEY = import.meta.env.VITE_CAT_API_KEY;

if (!API_KEY) throw new Error("VITE_CAT_API_KEY manquante : copiez .env.example en .env et ajoutez votre clé");

async function request(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return res;
}

const getJson = (path, init) => request(path, init).then((res) => res.json());
const postJson = (path, body) => getJson(path, { method: "POST", body: JSON.stringify(body) });

export const getBreeds = () => getJson("/breeds");

export async function searchImages({ breedId, page, limit }) {
  const params = new URLSearchParams({ limit, page, order: breedId ? "ASC" : "RAND", has_breeds: 1 });
  if (breedId) params.set("breed_ids", breedId);
  const res = await request(`/images/search?${params}`);
  const count = res.headers.get("pagination-count");
  return { images: await res.json(), total: count === null ? null : Number(count) };
}

export async function getRandomImage() {
  const [image] = await getJson("/images/search?limit=1&has_breeds=1");
  if (!image) throw new Error("TheCatAPI n'a renvoyé aucune image aléatoire");
  return image;
}

export const getFavourites = (subId) => getJson(`/favourites?sub_id=${encodeURIComponent(subId)}`);
export const addFavourite = (imageId, subId) => postJson("/favourites", { image_id: imageId, sub_id: subId });
export const removeFavourite = (favouriteId) => getJson(`/favourites/${favouriteId}`, { method: "DELETE" });

export const getVotes = (subId) => getJson(`/votes?sub_id=${encodeURIComponent(subId)}&limit=60&order=DESC`);
export const addVote = (imageId, subId, value) => postJson("/votes", { image_id: imageId, sub_id: subId, value });
