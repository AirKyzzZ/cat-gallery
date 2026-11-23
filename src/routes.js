import Layout from "./components/Layout.jsx";
import BreedDetailPage from "./pages/BreedDetailPage.jsx";
import BreedsPage from "./pages/BreedsPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import FavouritesPage from "./pages/FavouritesPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import VotePage from "./pages/VotePage.jsx";

export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        ErrorBoundary: ErrorPage,
        children: [
          { index: true, Component: GalleryPage },
          { path: "races", Component: BreedsPage },
          { path: "races/:breedId", Component: BreedDetailPage },
          { path: "vote", Component: VotePage },
          { path: "favoris", Component: FavouritesPage },
          { path: "*", Component: NotFoundPage },
        ],
      },
    ],
  },
];
