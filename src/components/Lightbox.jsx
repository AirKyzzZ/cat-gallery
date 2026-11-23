import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { isPlainKey, trapFocus } from "../utils/keyboard.js";
import FavouriteButton from "./FavouriteButton.jsx";
import Icon from "./Icon.jsx";

export default function Lightbox({
  image,
  position,
  count,
  favourite,
  pending,
  onToggleFavourite,
  onClose,
  onPrevious,
  onNext,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const breed = image.breeds?.[0];
  const label = breed ? `Chat ${breed.name}` : "Chat";

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
      previousFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    if (!dialogRef.current?.contains(document.activeElement)) closeRef.current?.focus();
  }, [position]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") trapFocus(event, dialogRef.current);
      if (!isPlainKey(event)) return;
      if (event.key === "ArrowLeft") onPrevious?.();
      if (event.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrevious, onNext]);

  return (
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${label}, photo ${position} sur ${count}`}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <button ref={closeRef} type="button" className="icon-button lightbox-close" onClick={onClose} aria-label="Fermer">
        <Icon name="x" />
      </button>
      {onPrevious && (
        <button type="button" className="icon-button lightbox-nav lightbox-prev" onClick={onPrevious} aria-label="Photo précédente">
          <Icon name="chevron-left" />
        </button>
      )}
      <figure className="lightbox-figure">
        <img src={image.url} alt={label} />
        <figcaption className="lightbox-caption">
          <div>
            <strong>{breed?.name ?? "Chat"}</strong>
            <span className="muted">
              {position} / {count}
            </span>
          </div>
          <div className="lightbox-actions">
            {breed && (
              <Link to={`/races/${breed.id}`} className="button button-secondary" onClick={onClose}>
                Voir la race
                <Icon name="arrow-right" size={16} />
              </Link>
            )}
            <FavouriteButton favourite={favourite} pending={pending} onToggle={onToggleFavourite} />
          </div>
        </figcaption>
      </figure>
      {onNext && (
        <button type="button" className="icon-button lightbox-nav lightbox-next" onClick={onNext} aria-label="Photo suivante">
          <Icon name="chevron-right" />
        </button>
      )}
    </div>
  );
}
