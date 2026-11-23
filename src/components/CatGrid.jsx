import CatCard from "./CatCard.jsx";

export default function CatGrid({ images, favourites }) {
  return (
    <ul className="grid">
      {images.map((image) => (
        <CatCard
          key={image.id}
          image={image}
          favourite={favourites.isFavourite(image.id)}
          pending={favourites.isPending(image.id)}
          onToggleFavourite={favourites.toggle}
        />
      ))}
    </ul>
  );
}
