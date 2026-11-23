import { Link } from "react-router";
import { countryFlag, countryName, groupLabel, splitTemperament } from "../utils/breeds.js";

export default function BreedCard({ breed }) {
  const traits = splitTemperament(breed.temperament).slice(0, 3);
  const group = groupLabel(breed.breed_group);
  return (
    <li>
      <Link to={`/races/${breed.id}`} className="breed-card">
        <div className="breed-card-media">
          {breed.image?.url ? (
            <img src={breed.image.url} alt="" loading="lazy" decoding="async" />
          ) : (
            <span className="placeholder-initial" aria-hidden="true">
              {breed.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="breed-card-body">
          <h2 className="breed-card-title">{breed.name}</h2>
          <p className="meta">
            <span>
              {countryFlag(breed.country_code)} {countryName(breed)}
            </span>
            {group && <span>{group}</span>}
          </p>
          {traits.length > 0 && (
            <ul className="chips">
              {traits.map((trait) => (
                <li key={trait} className="chip">
                  {trait}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </li>
  );
}
