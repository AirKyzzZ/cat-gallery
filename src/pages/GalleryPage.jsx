import { useSearchParams } from "react-router";
import BreedInfo from "../components/BreedInfo.jsx";
import BreedSelect from "../components/BreedSelect.jsx";
import Gallery from "../components/Gallery.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useBreedsContext } from "../context/contexts.js";

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { breeds, status, error } = useBreedsContext();
  const breedId = searchParams.get("race") ?? "";
  const selectedBreed = breeds.find((breed) => breed.id === breedId);

  const handleBreedChange = (id) => setSearchParams(id ? { race: id } : {});

  return (
    <>
      <title>Galerie · Cat Gallery</title>
      <PageHeader
        eyebrow="Galerie"
        title="Des chats, encore des chats"
        description="Parcourez les photos de TheCatAPI, filtrez par race, agrandissez vos préférées et gardez-les en favoris."
      >
        <BreedSelect
          breeds={breeds}
          breedId={breedId}
          onBreedChange={handleBreedChange}
          disabled={status !== "ready"}
        />
      </PageHeader>
      {status === "error" && <p className="muted form-hint">Filtre par race indisponible : {error}</p>}
      {selectedBreed && <BreedInfo breed={selectedBreed} />}
      <Gallery key={breedId} breedId={breedId} />
    </>
  );
}
