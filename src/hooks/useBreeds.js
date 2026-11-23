import { useEffect, useState } from "react";
import { getBreeds } from "../services/catApi.js";
import { describeError } from "../utils/errors.js";

export default function useBreeds() {
  const [breeds, setBreeds] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    getBreeds()
      .then((data) => {
        if (ignore) return;
        setBreeds(data);
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
  }, [attempt]);

  const retry = () => {
    setStatus("loading");
    setAttempt((current) => current + 1);
  };

  return { breeds, status, error, retry };
}
