export default function BreedSelect({ breeds, breedId, onBreedChange, disabled }) {
  return (
    <label className="field">
      <span className="field-label">Race</span>
      <select
        className="select"
        value={breedId}
        disabled={disabled}
        onChange={(event) => onBreedChange(event.target.value)}
      >
        <option value="">Toutes les races</option>
        {breeds.map((breed) => (
          <option key={breed.id} value={breed.id}>
            {breed.name}
          </option>
        ))}
      </select>
    </label>
  );
}
