import useCatImages from "../hooks/useCatImages.js";
import CatGrid from "./CatGrid.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "./StatusViews.jsx";

export default function Gallery({ breedId }) {
  const { images, total, status, error, hasMore, loadMore, retry } = useCatImages(breedId);

  if (images.length === 0) {
    if (status === "loading") return <SkeletonGrid />;
    if (status === "error") return <ErrorState message={error} onRetry={retry} />;
    return <EmptyState title="Aucun chat trouvé" description="Essayez une autre race." />;
  }

  return (
    <>
      <CatGrid images={images} />
      <div className="load-more" aria-live="polite">
        {status === "error" && <ErrorState message={error} onRetry={retry} />}
        {status !== "error" && hasMore && (
          <button type="button" className="button button-secondary" onClick={loadMore} disabled={status === "loading"}>
            {status === "loading" ? "Chargement…" : "Voir plus de chats"}
          </button>
        )}
        <p className="muted">
          {images.length} photo{images.length > 1 ? "s" : ""}
          {total !== null && ` sur ${total.toLocaleString("fr-FR")}`}
        </p>
      </div>
    </>
  );
}
