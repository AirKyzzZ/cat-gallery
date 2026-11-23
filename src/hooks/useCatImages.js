import { useEffect, useState } from "react";
import { searchImages } from "../services/catApi.js";

const PAGE_SIZE = 12;

export default function useCatImages(breedId) {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setStatus("loading");
    searchImages({ breedId, page, limit: PAGE_SIZE })
      .then((result) => {
        if (ignore) return;
        setImages((current) => [...current, ...result.images]);
        setTotal(result.total);
        setStatus("ready");
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [breedId, page]);

  const hasMore = images.length < total;
  const loadMore = () => setPage((current) => current + 1);

  return { images, status, error, hasMore, loadMore };
}
