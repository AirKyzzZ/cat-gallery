import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchImages } from "../services/catApi.js";
import { ApiError } from "../services/apiError.js";
import { makeImage } from "../test/fixtures.js";
import useCatImages from "./useCatImages.js";

vi.mock("../services/catApi.js", () => ({ searchImages: vi.fn() }));

const ids = (result) => result.current.images.map((image) => image.id);

describe("useCatImages", () => {
  beforeEach(() => {
    vi.mocked(searchImages).mockReset();
  });

  it("loads the first page of the requested breed", async () => {
    vi.mocked(searchImages).mockResolvedValueOnce({ images: [makeImage("a"), makeImage("b")], total: 4 });
    const { result } = renderHook(() => useCatImages("beng", 2));

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(searchImages).toHaveBeenCalledWith({ breedId: "beng", page: 0, limit: 2 });
    expect(ids(result)).toEqual(["a", "b"]);
    expect(result.current.hasMore).toBe(true);
  });

  it("appends the next page, skips duplicates and stops at the total", async () => {
    vi.mocked(searchImages)
      .mockResolvedValueOnce({ images: [makeImage("a"), makeImage("b")], total: 3 })
      .mockResolvedValueOnce({ images: [makeImage("b"), makeImage("c")], total: 3 });
    const { result } = renderHook(() => useCatImages("beng", 2));
    await waitFor(() => expect(result.current.status).toBe("ready"));

    act(() => result.current.loadMore());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("ready"));

    expect(searchImages).toHaveBeenLastCalledWith({ breedId: "beng", page: 1, limit: 2 });
    expect(ids(result)).toEqual(["a", "b", "c"]);
    expect(result.current.hasMore).toBe(false);
  });

  it("keeps offering more photos when the total is unknown", async () => {
    vi.mocked(searchImages).mockResolvedValueOnce({ images: [makeImage("a")], total: null });
    const { result } = renderHook(() => useCatImages("", 1));
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.hasMore).toBe(true);
  });

  it("exposes a readable error and retries the same page", async () => {
    vi.mocked(searchImages)
      .mockRejectedValueOnce(new ApiError(500, "/images/search"))
      .mockResolvedValueOnce({ images: [makeImage("a")], total: 1 });
    const { result } = renderHook(() => useCatImages("beng", 1));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toContain("HTTP 500");

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(searchImages).toHaveBeenCalledTimes(2);
    expect(searchImages).toHaveBeenLastCalledWith({ breedId: "beng", page: 0, limit: 1 });
    expect(ids(result)).toEqual(["a"]);
  });
});
