import useCatImages from "../hooks/useCatImages.js";
import CatGrid from "./CatGrid.jsx";

export default function Gallery({ breedId, favourites }) {
  const { images, status, error, hasMore, loadMore } = useCatImages(breedId);

  return (
    <>
      {images.length > 0 && <CatGrid images={images} favourites={favourites} />}
      {status === "loading" && <p className="status">Chargement…</p>}
      {status === "error" && <p className="status error">{error}</p>}
      {status === "ready" && images.length === 0 && <p className="status">Aucun chat trouvé</p>}
      {status === "ready" && hasMore && (
        <button type="button" className="load-more" onClick={loadMore}>Voir plus</button>
      )}
    </>
  );
}
