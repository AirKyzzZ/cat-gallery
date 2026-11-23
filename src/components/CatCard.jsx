import FavouriteButton from "./FavouriteButton.jsx";

export default function CatCard({ image, favourite, pending, onToggleFavourite, onOpen }) {
  const breed = image.breeds?.[0];
  const label = breed ? `Chat ${breed.name}` : "Chat";
  return (
    <li className="cat-card">
      <button type="button" className="cat-card-media" onClick={onOpen} aria-label={`Agrandir la photo : ${label}`}>
        <img src={image.url} alt={label} loading="lazy" decoding="async" />
        {breed && <span className="cat-card-caption">{breed.name}</span>}
      </button>
      <FavouriteButton
        className="cat-card-fav"
        favourite={favourite}
        pending={pending}
        onToggle={() => onToggleFavourite(image)}
      />
    </li>
  );
}
