import { Link } from "react-router";
import { countryFlag, countryName, formatRange } from "../utils/breeds.js";
import Icon from "./Icon.jsx";

export default function BreedInfo({ breed }) {
  return (
    <section className="breed-info" aria-label={`Race sélectionnée : ${breed.name}`}>
      {breed.image?.url && <img src={breed.image.url} alt="" className="breed-info-thumb" />}
      <div className="breed-info-body">
        <h2>{breed.name}</h2>
        <p className="meta">
          <span>
            {countryFlag(breed.country_code)} {countryName(breed)}
          </span>
          <span>{formatRange(breed.life_span, "ans")}</span>
        </p>
        <p className="breed-info-description">{breed.description}</p>
      </div>
      <Link to={`/races/${breed.id}`} className="button button-secondary">
        Fiche complète
        <Icon name="arrow-right" size={16} />
      </Link>
    </section>
  );
}
