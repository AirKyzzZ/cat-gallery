import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./apiError.js";
import {
  BASE_URL,
  addFavourite,
  addVote,
  getBreeds,
  getFavourites,
  getRandomImage,
  removeFavourite,
  searchImages,
} from "./catApi.js";

const jsonResponse = (body, { status = 200, headers = {} } = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

const lastCall = (fetchMock) => {
  const [url, init] = fetchMock.mock.calls.at(-1);
  return { url: new URL(url), init };
};

describe("catApi", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the API key with every request", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    await getBreeds();
    const { url, init } = lastCall(fetchMock);
    expect(url.href).toBe(`${BASE_URL}/breeds`);
    expect(init.headers["x-api-key"]).toBe("test-key");
  });

  it("paginates a breed in a stable order and reads the total from the headers", async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: "a" }], { headers: { "pagination-count": "42" } }));
    const result = await searchImages({ breedId: "beng", page: 2, limit: 12 });
    const { url } = lastCall(fetchMock);
    expect(url.pathname).toBe("/v1/images/search");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      limit: "12",
      page: "2",
      order: "ASC",
      has_breeds: "1",
      breed_ids: "beng",
    });
    expect(result).toEqual({ images: [{ id: "a" }], total: 42 });
  });

  it("shuffles images when no breed is selected and reports an unknown total", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    const result = await searchImages({ breedId: "", page: 0, limit: 12 });
    const { url } = lastCall(fetchMock);
    expect(url.searchParams.get("order")).toBe("RAND");
    expect(url.searchParams.has("breed_ids")).toBe(false);
    expect(result.total).toBeNull();
  });

  it("throws an ApiError carrying the status and path", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "slow down" }, { status: 429 }));
    const error = await getBreeds().catch((err) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 429, path: "/breeds" });
  });

  it("fails loudly when the random endpoint returns nothing", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    await expect(getRandomImage()).rejects.toThrow("aucune image");
  });

  it("encodes the sub id when listing favourites", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    await getFavourites("user 1/2");
    const { url } = lastCall(fetchMock);
    expect(url.search).toBe("?sub_id=user%201%2F2");
    expect(url.searchParams.get("sub_id")).toBe("user 1/2");
  });

  it("creates and deletes favourites with the right verbs and payload", async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ id: 7, message: "SUCCESS" }));
    await expect(addFavourite("img1", "sub")).resolves.toMatchObject({ id: 7 });
    let { url, init } = lastCall(fetchMock);
    expect(url.pathname).toBe("/v1/favourites");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ image_id: "img1", sub_id: "sub" });

    await removeFavourite(7);
    ({ url, init } = lastCall(fetchMock));
    expect(url.pathname).toBe("/v1/favourites/7");
    expect(init.method).toBe("DELETE");
  });

  it("posts a vote with its value", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 3 }));
    await addVote("img1", "sub", -1);
    const { url, init } = lastCall(fetchMock);
    expect(url.pathname).toBe("/v1/votes");
    expect(JSON.parse(init.body)).toEqual({ image_id: "img1", sub_id: "sub", value: -1 });
  });
});
