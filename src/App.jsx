import { useEffect, useState } from "react";
import { getBreeds } from "./services/catApi.js";
import useFavourites from "./hooks/useFavourites.js";
import Header from "./components/Header.jsx";
import BreedSelect from "./components/BreedSelect.jsx";
import BreedInfo from "./components/BreedInfo.jsx";
import Gallery from "./components/Gallery.jsx";
import FavouritesView from "./components/FavouritesView.jsx";

export default function App() {
  const [view, setView] = useState("gallery");
  const [breeds, setBreeds] = useState([]);
  const [breedsError, setBreedsError] = useState("");
  const [breedId, setBreedId] = useState("");
  const favourites = useFavourites();

  useEffect(() => {
    getBreeds()
      .then(setBreeds)
      .catch((err) => setBreedsError(err.message));
  }, []);

  const selectedBreed = breeds.find((b) => b.id === breedId);

  return (
    <>
      <Header view={view} onViewChange={setView} favouriteCount={favourites.items.length} />
      <main>
        {favourites.error && <p className="status error">{favourites.error}</p>}
        {view === "gallery" ? (
          <>
            <BreedSelect breeds={breeds} breedId={breedId} onBreedChange={setBreedId} />
            {breedsError && <p className="status error">{breedsError}</p>}
            {selectedBreed && <BreedInfo breed={selectedBreed} />}
            <Gallery key={breedId} breedId={breedId} favourites={favourites} />
          </>
        ) : (
          <FavouritesView favourites={favourites} />
        )}
      </main>
    </>
  );
}
