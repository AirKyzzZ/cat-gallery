import CatGrid from "./CatGrid.jsx";

export default function FavouritesView({ favourites }) {
  if (favourites.status === "loading") return <p className="status">Chargement…</p>;
  if (favourites.status === "error") return null;
  if (favourites.items.length === 0) return <p className="status">Aucun favori pour l'instant</p>;

  const images = favourites.items.map((f) => f.image);
  return <CatGrid images={images} favourites={favourites} />;
}
