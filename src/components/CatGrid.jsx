import { useState } from "react";
import { useFavouritesContext } from "../context/contexts.js";
import CatCard from "./CatCard.jsx";
import Lightbox from "./Lightbox.jsx";

export default function CatGrid({ images }) {
  const favourites = useFavouritesContext();
  const [requestedIndex, setOpenIndex] = useState(null);
  const openIndex = requestedIndex === null || images.length === 0 ? null : Math.min(requestedIndex, images.length - 1);
  const openImage = openIndex === null ? null : images[openIndex];
  const favouritesReady = favourites.status === "ready";

  return (
    <>
      <ul className="cat-grid">
        {images.map((image, index) => (
          <CatCard
            key={image.id}
            image={image}
            favourite={favourites.isFavourite(image.id)}
            pending={!favouritesReady || favourites.isPending(image.id)}
            onToggleFavourite={favourites.toggle}
            onOpen={() => setOpenIndex(index)}
          />
        ))}
      </ul>
      {openImage && (
        <Lightbox
          image={openImage}
          position={openIndex + 1}
          count={images.length}
          favourite={favourites.isFavourite(openImage.id)}
          pending={!favouritesReady || favourites.isPending(openImage.id)}
          onToggleFavourite={() => favourites.toggle(openImage)}
          onClose={() => setOpenIndex(null)}
          onPrevious={openIndex > 0 ? () => setOpenIndex(openIndex - 1) : undefined}
          onNext={openIndex < images.length - 1 ? () => setOpenIndex(openIndex + 1) : undefined}
        />
      )}
    </>
  );
}
