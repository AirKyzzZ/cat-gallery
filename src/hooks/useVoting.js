import { useEffect, useState } from "react";
import { addVote, getRandomImage, getVotes } from "../services/catApi.js";
import { describeError } from "../utils/errors.js";
import { getSubId } from "../utils/subId.js";

export const LIKE = 1;
export const DISLIKE = -1;

const THUMBNAILS_KEY = "cat-gallery:vote-thumbnails";
const MAX_THUMBNAILS = 60;

const readThumbnails = () => JSON.parse(localStorage.getItem(THUMBNAILS_KEY) ?? "{}");

function saveThumbnail(imageId, url) {
  const others = Object.entries(readThumbnails()).filter(([id]) => id !== imageId);
  const next = Object.fromEntries([[imageId, url], ...others].slice(0, MAX_THUMBNAILS));
  localStorage.setItem(THUMBNAILS_KEY, JSON.stringify(next));
}

function withThumbnails(votes) {
  const thumbnails = readThumbnails();
  return votes.map((vote) => {
    const url = vote.image?.url ?? thumbnails[vote.image_id];
    return url ? { ...vote, image: { id: vote.image_id, url } } : vote;
  });
}

export default function useVoting() {
  const [subId] = useState(getSubId);
  const [round, setRound] = useState(0);
  const [image, setImage] = useState(null);
  const [imageStatus, setImageStatus] = useState("loading");
  const [votes, setVotes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getRandomImage()
      .then((next) => {
        if (ignore) return;
        setImage(next);
        setImageStatus("ready");
      })
      .catch((err) => {
        if (ignore) return;
        setError(describeError(err));
        setImageStatus("error");
      });
    return () => {
      ignore = true;
    };
  }, [round]);

  useEffect(() => {
    let ignore = false;
    getVotes(subId)
      .then((data) => {
        if (!ignore) setVotes(withThumbnails(data));
      })
      .catch((err) => {
        if (!ignore) setError(describeError(err));
      });
    return () => {
      ignore = true;
    };
  }, [subId]);

  const next = () => {
    setError("");
    setImageStatus("loading");
    setRound((current) => current + 1);
  };

  const vote = async (value) => {
    if (!image || imageStatus !== "ready" || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const { id } = await addVote(image.id, subId, value);
      const saved = { id, image_id: image.id, value, created_at: new Date().toISOString(), image };
      setVotes((current) => [saved, ...current]);
      next();
      saveThumbnail(image.id, image.url);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const likes = votes.filter((v) => v.value > 0).length;

  return {
    image,
    imageStatus,
    votes,
    likes,
    dislikes: votes.length - likes,
    submitting,
    error,
    vote,
    skip: next,
  };
}
