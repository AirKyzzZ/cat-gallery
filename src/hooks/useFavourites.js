import { useEffect, useState } from "react";
import { addFavourite, getFavourites, removeFavourite } from "../services/catApi.js";
import { describeError } from "../utils/errors.js";
import { getSubId } from "../utils/subId.js";

export default function useFavourites() {
  const [subId] = useState(getSubId);
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
        setError(describeError(err));
        setStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [subId]);

  const isFavourite = (imageId) => items.some((f) => f.image_id === imageId);
  const isPending = (imageId) => pendingIds.includes(imageId);
  const clearError = () => setError("");

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
        const saved = { id: image.id, url: image.url, breeds: image.breeds };
        setItems((current) => [{ id, image_id: image.id, image: saved }, ...current]);
      }
    } catch (err) {
      setError(describeError(err));
    } finally {
      setPendingIds((ids) => ids.filter((pendingId) => pendingId !== image.id));
    }
  };

  return { items, status, error, isFavourite, isPending, toggle, clearError };
}
