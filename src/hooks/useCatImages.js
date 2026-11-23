import { useEffect, useState } from "react";
import { searchImages } from "../services/catApi.js";
import { describeError } from "../utils/errors.js";

const PAGE_SIZE = 12;

export default function useCatImages(breedId, pageSize = PAGE_SIZE) {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    searchImages({ breedId, page, limit: pageSize })
      .then((result) => {
        if (ignore) return;
        setImages((current) => {
          const known = new Set(current.map((image) => image.id));
          return [...current, ...result.images.filter((image) => !known.has(image.id))];
        });
        setTotal(result.total);
        setStatus("ready");
      })
      .catch((err) => {
        if (ignore) return;
        setError(describeError(err));
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [breedId, page, pageSize, attempt]);

  const hasMore = total === null || images.length < total;

  const loadMore = () => {
    setStatus("loading");
    setPage((current) => current + 1);
  };

  const retry = () => {
    setStatus("loading");
    setAttempt((current) => current + 1);
  };

  return { images, total, status, error, hasMore, loadMore, retry };
}
