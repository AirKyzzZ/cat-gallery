export default function BreedSelect({ breeds, breedId, onBreedChange }) {
  return (
    <select className="breed-select" value={breedId} onChange={(e) => onBreedChange(e.target.value)}>
      <option value="">Toutes les races</option>
      {breeds.map((breed) => (
        <option key={breed.id} value={breed.id}>{breed.name}</option>
      ))}
    </select>
  );
}
