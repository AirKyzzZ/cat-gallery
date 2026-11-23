import { useState } from "react";
import { useLocation, useNavigationType, useSearchParams } from "react-router";
import BreedCard from "../components/BreedCard.jsx";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/StatusViews.jsx";
import { useBreedsContext } from "../context/contexts.js";
import { SORT_OPTIONS, filterBreeds, groupOptions, originOptions, sortBreeds } from "../utils/breeds.js";

const PARAMS = { query: "q", group: "groupe", origin: "origine", sort: "tri" };

export default function BreedsPage() {
  const { breeds, status, error, retry } = useBreedsContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigationType = useNavigationType();
  const urlQuery = searchParams.get(PARAMS.query) ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [syncedLocationKey, setSyncedLocationKey] = useState(location.key);

  if (location.key !== syncedLocationKey) {
    setSyncedLocationKey(location.key);
    if (navigationType !== "REPLACE") setQuery(urlQuery);
  }

  const filters = {
    query,
    group: searchParams.get(PARAMS.group) ?? "",
    origin: searchParams.get(PARAMS.origin) ?? "",
  };
  const sort = searchParams.get(PARAMS.sort) ?? "name";
  const hasFilters = Boolean(filters.query || filters.group || filters.origin);
  const results = sortBreeds(filterBreeds(breeds, filters), sort);

  const updateParam = (key, value) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(PARAMS[key], value);
        else next.delete(PARAMS[key]);
        return next;
      },
      { replace: true },
    );
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    updateParam("query", value.trim());
  };

  const resetFilters = () => {
    setQuery("");
    setSearchParams(sort === "name" ? {} : { [PARAMS.sort]: sort }, { replace: true });
  };

  return (
    <>
      <title>Races · Cat Gallery</title>
      <PageHeader
        eyebrow="Encyclopédie"
        title="Toutes les races"
        description={
          status === "ready"
            ? `${breeds.length} races de chats du monde entier. Cherchez, filtrez, comparez.`
            : "Cherchez, filtrez et comparez les races de chats."
        }
      />

      <div className="toolbar" role="search">
        <label className="field search-field">
          <span className="field-label">Rechercher</span>
          <span className="search">
            <Icon name="search" size={18} />
            <input
              type="search"
              className="input"
              placeholder="Bengal, Maine Coon…"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
            />
          </span>
        </label>
        <label className="field">
          <span className="field-label">Pelage</span>
          <select className="select" value={filters.group} onChange={(event) => updateParam("group", event.target.value)}>
            <option value="">Tous les pelages</option>
            {groupOptions(breeds).map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Origine</span>
          <select className="select" value={filters.origin} onChange={(event) => updateParam("origin", event.target.value)}>
            <option value="">Toutes les origines</option>
            {originOptions(breeds).map((origin) => (
              <option key={origin.code} value={origin.code}>
                {origin.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Trier par</span>
          <select className="select" value={sort} onChange={(event) => updateParam("sort", event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "loading" && <SkeletonGrid variant="breed" count={6} />}
      {status === "error" && <ErrorState message={error} onRetry={retry} />}
      {status === "ready" && (
        <>
          <p className="results-count" aria-live="polite">
            {results.length} race{results.length > 1 ? "s" : ""}
            {hasFilters && (
              <button type="button" className="link-button" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            )}
          </p>
          {results.length > 0 ? (
            <ul className="breed-grid">
              {results.map((breed) => (
                <BreedCard key={breed.id} breed={breed} />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="search"
              title="Aucune race ne correspond"
              description="Essayez un autre nom ou retirez un filtre."
              action={
                <button type="button" className="button" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              }
            />
          )}
        </>
      )}
    </>
  );
}
