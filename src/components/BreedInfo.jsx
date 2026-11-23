export default function BreedInfo({ breed }) {
  return (
    <section className="breed-info">
      <h2>{breed.name}</h2>
      <p className="muted">{breed.origin} · {breed.life_span} ans</p>
      <p>{breed.description}</p>
      <p className="muted">{breed.temperament}</p>
      {breed.wikipedia_url && (
        <a href={breed.wikipedia_url} target="_blank" rel="noreferrer">Wikipédia</a>
      )}
    </section>
  );
}
