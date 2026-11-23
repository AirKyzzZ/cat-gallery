import Icon from "./Icon.jsx";

export function EmptyState({ icon = "paw", title, description, action }) {
  return (
    <div className="state">
      <span className="state-icon">
        <Icon name={icon} size={26} />
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <span className="state-icon">
        <Icon name="alert" size={26} />
      </span>
      <h2>Oups, les chats se cachent</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          Réessayer
        </button>
      )}
    </div>
  );
}

export function SkeletonGrid({ count = 8, variant = "cat" }) {
  return (
    <ul className={variant === "breed" ? "breed-grid" : "cat-grid"} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={`skeleton skeleton-${variant}`} />
      ))}
    </ul>
  );
}
