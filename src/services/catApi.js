export const BASE_URL = "https://api.thecatapi.com/v1";
const API_KEY = import.meta.env.VITE_CAT_API_KEY;

if (!API_KEY) throw new Error("VITE_CAT_API_KEY manquante : copiez .env.example en .env et ajoutez votre clé");

async function request(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${path}`);
  return res;
}

const getJson = (path, init) => request(path, init).then((res) => res.json());

export const getBreeds = () => getJson("/breeds");

export async function searchImages({ breedId, page, limit }) {
  const params = new URLSearchParams({ limit, page, order: "ASC", has_breeds: 1 });
  if (breedId) params.set("breed_ids", breedId);
  const res = await request(`/images/search?${params}`);
  const total = Number(res.headers.get("pagination-count"));
  return { images: await res.json(), total };
}

export const getFavourites = (subId) => getJson(`/favourites?sub_id=${encodeURIComponent(subId)}`);
export const addFavourite = (imageId, subId) =>
  getJson("/favourites", { method: "POST", body: JSON.stringify({ image_id: imageId, sub_id: subId }) });
export const removeFavourite = (favouriteId) => getJson(`/favourites/${favouriteId}`, { method: "DELETE" });
