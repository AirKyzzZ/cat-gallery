export default function Header({ view, onViewChange, favouriteCount }) {
  return (
    <header>
      <h1>Cat Gallery</h1>
      <nav>
        <button type="button" className={view === "gallery" ? "active" : ""} onClick={() => onViewChange("gallery")}>
          Galerie
        </button>
        <button type="button" className={view === "favourites" ? "active" : ""} onClick={() => onViewChange("favourites")}>
          Favoris · {favouriteCount}
        </button>
      </nav>
    </header>
  );
}
