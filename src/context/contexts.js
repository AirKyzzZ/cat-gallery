import { createContext, use } from "react";

export const BreedsContext = createContext(null);
export const FavouritesContext = createContext(null);

function useRequiredContext(context, name) {
  const value = use(context);
  if (!value) throw new Error(`${name} doit être utilisé dans <AppProviders>`);
  return value;
}

export const useBreedsContext = () => useRequiredContext(BreedsContext, "useBreedsContext");
export const useFavouritesContext = () => useRequiredContext(FavouritesContext, "useFavouritesContext");
