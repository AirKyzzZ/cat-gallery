import Icon from "./Icon.jsx";

export default function FavouriteButton({ favourite, pending, onToggle, className = "" }) {
  return (
    <button
      type="button"
      className={`fav-button ${favourite ? "is-active" : ""} ${className}`}
      disabled={pending}
      aria-pressed={favourite}
      aria-label={favourite ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={onToggle}
    >
      <Icon name="heart" size={20} filled={favourite} />
    </button>
  );
}
