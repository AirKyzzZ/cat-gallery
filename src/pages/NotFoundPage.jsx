import { Link, useLocation } from "react-router";

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="not-found">
      <title>Page introuvable · Cat Gallery</title>
      <p className="not-found-code">404</p>
      <h1>Ce chat s'est échappé</h1>
      <p className="muted">
        La page <code>{pathname}</code> n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="button">
        Retour à la galerie
      </Link>
    </div>
  );
}
