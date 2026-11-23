import { Link } from "react-router";
import CatGrid from "../components/CatGrid.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/StatusViews.jsx";
import { useFavouritesContext } from "../context/contexts.js";

export default function FavouritesPage() {
  const favourites = useFavouritesContext();
  const count = favourites.items.length;

  return (
    <>
      <title>Favoris · Cat Gallery</title>
      <PageHeader
        eyebrow="Favoris"
        title="Vos chats préférés"
        description={
          favourites.status === "ready" && count > 0
            ? `${count} photo${count > 1 ? "s" : ""} gardée${count > 1 ? "s" : ""} de côté, synchronisée${count > 1 ? "s" : ""} avec TheCatAPI.`
            : "Les photos que vous ajoutez en favoris apparaissent ici."
        }
      />
      {favourites.status === "loading" && <SkeletonGrid count={4} />}
      {favourites.status === "error" && count === 0 && (
        <ErrorState message="Vos favoris n'ont pas pu être chargés. Rechargez la page pour réessayer." />
      )}
      {favourites.status === "ready" && count === 0 && (
        <EmptyState
          icon="heart"
          title="Aucun favori pour l'instant"
          description="Touchez le cœur d'une photo dans la galerie pour la retrouver ici."
          action={
            <Link to="/" className="button">
              Explorer la galerie
            </Link>
          }
        />
      )}
      {count > 0 && <CatGrid images={favourites.items.map((favourite) => favourite.image)} />}
    </>
  );
}
