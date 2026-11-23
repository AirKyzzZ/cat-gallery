import { Outlet, ScrollRestoration } from "react-router";
import { useFavouritesContext } from "../context/contexts.js";
import Alert from "./Alert.jsx";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

export default function Layout() {
  const favourites = useFavouritesContext();
  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="container page">
        {favourites.error && <Alert onDismiss={favourites.clearError}>{favourites.error}</Alert>}
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
