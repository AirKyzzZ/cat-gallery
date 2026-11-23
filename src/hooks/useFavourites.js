import { useEffect, useState } from "react";
import { addFavourite, getFavourites, removeFavourite } from "../services/catApi.js";

const SUB_ID_KEY = "cat-gallery:sub-id";

function readSubId() {
  const saved = localStorage.getItem(SUB_ID_KEY);
  if (saved) return saved;
  const created = crypto.randomUUID();
  localStorage.setItem(SUB_ID_KEY, created);
  return created;
}

export default function useFavourites() {
  const [subId] = useState(readSubId);
  const [items, setItems] = useState([]);
  const [pendingIds, setPendingIds] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getFavourites(subId)
      .then((data) => {
        if (ignore) return;
        setItems(data);
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
  }, [subId]);

  const isFavourite = (imageId) => items.some((f) => f.image_id === imageId);
  const isPending = (imageId) => pendingIds.includes(imageId);

  const toggle = async (image) => {
    const existing = items.find((f) => f.image_id === image.id);
    setPendingIds((ids) => [...ids, image.id]);
    setError("");
    try {
      if (existing) {
        await removeFavourite(existing.id);
        setItems((current) => current.filter((f) => f.id !== existing.id));
      } else {
        const { id } = await addFavourite(image.id, subId);
        setItems((current) => [{ id, image_id: image.id, image: { id: image.id, url: image.url } }, ...current]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingIds((ids) => ids.filter((pendingId) => pendingId !== image.id));
    }
  };

  return { items, status, error, isFavourite, isPending, toggle };
}
