import useBreeds from "../hooks/useBreeds.js";
import useFavourites from "../hooks/useFavourites.js";
import { BreedsContext, FavouritesContext } from "./contexts.js";

export default function AppProviders({ children }) {
  const breeds = useBreeds();
  const favourites = useFavourites();
  return (
    <BreedsContext value={breeds}>
      <FavouritesContext value={favourites}>{children}</FavouritesContext>
    </BreedsContext>
  );
}
