import useTheme from "../hooks/useTheme.js";
import Icon from "./Icon.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
    >
      <Icon name={isDark ? "sun" : "moon"} size={18} />
    </button>
  );
}
