import { Link, NavLink } from "react-router";
import { useFavouritesContext } from "../context/contexts.js";
import Icon from "./Icon.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const LINKS = [
  { to: "/", label: "Galerie", end: true },
  { to: "/races", label: "Races" },
  { to: "/vote", label: "Vote" },
];

export default function Header() {
  const { items } = useFavouritesContext();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="cat" size={20} />
          </span>
          Cat Gallery
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/favoris" className="nav-link">
            Favoris
            <span className="badge">{items.length}</span>
          </NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
