import { Link, useParams } from "react-router";
import Gallery from "../components/Gallery.jsx";
import Icon from "../components/Icon.jsx";
import { EmptyState, ErrorState } from "../components/StatusViews.jsx";
import { useBreedsContext } from "../context/contexts.js";
import { countryFlag, countryName, formatRange, groupLabel, splitTemperament } from "../utils/breeds.js";

function BackLink() {
  return (
    <Link to="/races" className="back-link">
      <Icon name="arrow-left" size={16} />
      Toutes les races
    </Link>
  );
}

export default function BreedDetailPage() {
  const { breedId } = useParams();
  const { breeds, status, error, retry } = useBreedsContext();

  if (status === "loading") {
    return (
      <div className="breed-hero" aria-busy="true">
        <div className="skeleton breed-hero-media" />
        <div className="skeleton skeleton-text" />
      </div>
    );
  }
  if (status === "error") return <ErrorState message={error} onRetry={retry} />;

  const breed = breeds.find((item) => item.id === breedId);
  if (!breed) {
    return (
      <>
        <title>Race introuvable · Cat Gallery</title>
        <BackLink />
        <EmptyState
          icon="search"
          title="Race introuvable"
          description={`Aucune race ne correspond à l'identifiant « ${breedId} ».`}
          action={
            <Link to="/races" className="button">
              Voir toutes les races
            </Link>
          }
        />
      </>
    );
  }

  const traits = splitTemperament(breed.temperament);
  const group = groupLabel(breed.breed_group);

  return (
    <article>
      <title>{`${breed.name} · Cat Gallery`}</title>
      <BackLink />
      <div className="breed-hero">
        <div className="breed-hero-media">
          {breed.image?.url ? (
            <img src={breed.image.url} alt={`Chat ${breed.name}`} />
          ) : (
            <span className="placeholder-initial" aria-hidden="true">
              {breed.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="eyebrow">
            {countryFlag(breed.country_code)} {countryName(breed)}
            {group && ` · ${group}`}
          </p>
          <h1>{breed.name}</h1>
          {breed.alt_names && <p className="muted">Aussi appelé : {breed.alt_names}</p>}
          <p className="lead">{breed.description}</p>
          <dl className="stats">
            <div className="stat">
              <dt>Espérance de vie</dt>
              <dd>{formatRange(breed.life_span, "ans")}</dd>
            </div>
            <div className="stat">
              <dt>Poids</dt>
              <dd>{formatRange(breed.weight?.metric, "kg")}</dd>
            </div>
            <div className="stat">
              <dt>Taille</dt>
              <dd>{formatRange(breed.height?.metric, "cm")}</dd>
            </div>
          </dl>
          {traits.length > 0 && (
            <ul className="chips" aria-label="Tempérament">
              {traits.map((trait) => (
                <li key={trait} className="chip">
                  {trait}
                </li>
              ))}
            </ul>
          )}
          <div className="actions">
            <Link to={`/?race=${breed.id}`} className="button">
              Voir dans la galerie
            </Link>
            {breed.wikipedia_url && (
              <a href={breed.wikipedia_url} target="_blank" rel="noreferrer" className="button button-secondary">
                Wikipédia
                <Icon name="external" size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {breed.history && (
        <section className="section">
          <h2 className="section-title">Histoire</h2>
          <p className="prose">{breed.history}</p>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Photos de {breed.name}</h2>
        <Gallery key={breed.id} breedId={breed.id} />
      </section>
    </article>
  );
}
