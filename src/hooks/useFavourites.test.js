import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addFavourite, getFavourites, removeFavourite } from "../services/catApi.js";
import { ApiError } from "../services/apiError.js";
import { makeImage } from "../test/fixtures.js";
import useFavourites from "./useFavourites.js";

vi.mock("../services/catApi.js", () => ({
  getFavourites: vi.fn(),
  addFavourite: vi.fn(),
  removeFavourite: vi.fn(),
}));

const stored = { id: 10, image_id: "a", image: makeImage("a") };

async function renderLoaded(initial = []) {
  vi.mocked(getFavourites).mockResolvedValueOnce(initial);
  const hook = renderHook(() => useFavourites());
  await waitFor(() => expect(hook.result.current.status).toBe("ready"));
  return hook.result;
}

describe("useFavourites", () => {
  beforeEach(() => {
    vi.mocked(getFavourites).mockReset();
    vi.mocked(addFavourite).mockReset();
    vi.mocked(removeFavourite).mockReset();
  });

  it("loads the favourites of a sub id persisted in localStorage", async () => {
    const result = await renderLoaded([stored]);
    const subId = localStorage.getItem("cat-gallery:sub-id");

    expect(subId).toMatch(/^[0-9a-f-]{36}$/);
    expect(getFavourites).toHaveBeenCalledWith(subId);
    expect(result.current.isFavourite("a")).toBe(true);
    expect(result.current.isFavourite("b")).toBe(false);
  });

  it("reuses the same sub id across sessions", async () => {
    localStorage.setItem("cat-gallery:sub-id", "known-user");
    await renderLoaded();
    expect(getFavourites).toHaveBeenCalledWith("known-user");
  });

  it("adds a favourite and shows it as pending while the request runs", async () => {
    const result = await renderLoaded();
    let resolveAdd;
    vi.mocked(addFavourite).mockReturnValueOnce(new Promise((resolve) => (resolveAdd = resolve)));

    let toggle;
    act(() => {
      toggle = result.current.toggle(makeImage("b"));
    });
    expect(result.current.isPending("b")).toBe(true);

    await act(async () => {
      resolveAdd({ id: 11 });
      await toggle;
    });
    expect(result.current.isPending("b")).toBe(false);
    expect(result.current.isFavourite("b")).toBe(true);
    expect(result.current.items[0]).toMatchObject({ id: 11, image_id: "b", image: { id: "b" } });
  });

  it("removes an existing favourite by its favourite id", async () => {
    const result = await renderLoaded([stored]);
    vi.mocked(removeFavourite).mockResolvedValueOnce({ message: "SUCCESS" });

    await act(() => result.current.toggle(makeImage("a")));

    expect(removeFavourite).toHaveBeenCalledWith(10);
    expect(result.current.items).toEqual([]);
  });

  it("keeps the list unchanged and explains the failure", async () => {
    const result = await renderLoaded([stored]);
    vi.mocked(removeFavourite).mockRejectedValueOnce(new ApiError(429, "/favourites/10"));

    await act(() => result.current.toggle(makeImage("a")));

    expect(result.current.items).toEqual([stored]);
    expect(result.current.isPending("a")).toBe(false);
    expect(result.current.error).toContain("Trop de requêtes");

    act(() => result.current.clearError());
    expect(result.current.error).toBe("");
  });
});
