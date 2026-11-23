import Icon from "./Icon.jsx";

export default function Alert({ children, onDismiss }) {
  return (
    <div className="alert" role="alert">
      <Icon name="alert" size={18} />
      <p>{children}</p>
      {onDismiss && (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Fermer le message">
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );
}
