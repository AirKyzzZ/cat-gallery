import { useEffect } from "react";
import { Link } from "react-router";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { ErrorState } from "../components/StatusViews.jsx";
import useVoting, { DISLIKE, LIKE } from "../hooks/useVoting.js";
import { countryFlag, countryName } from "../utils/breeds.js";
import { isPlainKey } from "../utils/keyboard.js";

const isTyping = (target) => target instanceof HTMLElement && target.closest("input, select, textarea");

export default function VotePage() {
  const { image, imageStatus, votes, likes, dislikes, submitting, error, vote, skip } = useVoting();
  const breed = image?.breeds?.[0];
  const busy = submitting || imageStatus !== "ready";

  useEffect(() => {
    const handleKey = (event) => {
      if (isTyping(event.target) || !isPlainKey(event) || event.repeat) return;
      if (event.key === "ArrowRight") vote(LIKE);
      if (event.key === "ArrowLeft") vote(DISLIKE);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [vote]);

  const history = votes.filter((item) => item.image?.url).slice(0, 12);

  return (
    <>
      <title>Vote · Cat Gallery</title>
      <PageHeader
        eyebrow="Vote"
        title="Coup de cœur ou pas ?"
        description="Un chat au hasard, un vote. Vos votes sont enregistrés sur TheCatAPI et rattachés à ce navigateur."
      >
        <div className="vote-score">
          <span className="pill pill-like">
            <Icon name="heart" size={16} filled />
            {likes} j'aime
          </span>
          <span className="pill">
            <Icon name="thumbs-down" size={16} />
            {dislikes} bof
          </span>
        </div>
      </PageHeader>

      <div className="vote-layout">
        <section className="vote-card" aria-label="Chat à noter">
          {imageStatus === "error" ? (
            <ErrorState message={error} onRetry={skip} />
          ) : (
            <>
              <div className="vote-media" aria-busy={imageStatus === "loading"}>
                {imageStatus === "ready" ? (
                  <img key={image.id} src={image.url} alt={breed ? `Chat ${breed.name}` : "Chat"} />
                ) : (
                  <div className="skeleton" />
                )}
              </div>
              <div className="vote-info">
                <div>
                  <strong>{imageStatus === "ready" ? (breed?.name ?? "Race inconnue") : "Chargement…"}</strong>
                  {breed && (
                    <p className="muted">
                      {countryFlag(breed.country_code)} {countryName(breed)}
                    </p>
                  )}
                </div>
                {breed && (
                  <Link to={`/races/${breed.id}`} className="link-button">
                    Voir la race
                  </Link>
                )}
              </div>
              <div className="vote-actions">
                <button
                  type="button"
                  className="vote-button vote-dislike"
                  onClick={() => vote(DISLIKE)}
                  disabled={busy}
                  aria-label="Bof"
                >
                  <Icon name="thumbs-down" size={26} />
                </button>
                <button type="button" className="button button-ghost" onClick={skip} disabled={busy}>
                  <Icon name="skip" size={16} />
                  Passer
                </button>
                <button
                  type="button"
                  className="vote-button vote-like"
                  onClick={() => vote(LIKE)}
                  disabled={busy}
                  aria-label="J'aime"
                >
                  <Icon name="heart" size={26} filled />
                </button>
              </div>
              <p className="hint">
                Raccourcis clavier : <kbd>←</kbd> bof, <kbd>→</kbd> j'aime
              </p>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </section>

        <aside className="vote-history" aria-label="Historique des votes">
          <h2>Vos derniers votes</h2>
          {history.length === 0 ? (
            <p className="muted">Aucun vote pour l'instant. À vous de jouer !</p>
          ) : (
            <ul className="history-grid">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <img src={item.image.url} alt="" loading="lazy" />
                  <span className={`history-badge ${item.value > 0 ? "is-like" : ""}`}>
                    <Icon name={item.value > 0 ? "heart" : "thumbs-down"} size={14} filled={item.value > 0} />
                    <span className="visually-hidden">{item.value > 0 ? "J'aime" : "Bof"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}
