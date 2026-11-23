export default function CatCard({ image, favourite, pending, onToggleFavourite }) {
  const breed = image.breeds?.[0];
  return (
    <li className="card">
      <img src={image.url} alt={breed ? `Chat ${breed.name}` : "Chat"} loading="lazy" />
      <div className="card-footer">
        <span className="muted">{breed?.name}</span>
        <button
          type="button"
          className={favourite ? "fav active" : "fav"}
          disabled={pending}
          aria-label={favourite ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={() => onToggleFavourite(image)}
        >
          {favourite ? "♥" : "♡"}
        </button>
      </div>
    </li>
  );
}
