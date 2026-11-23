import { ApiError } from "../services/apiError.js";

export function describeError(error) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return "La clé TheCatAPI est refusée. Vérifiez VITE_CAT_API_KEY.";
    if (error.status === 404) return "Ressource introuvable sur TheCatAPI.";
    if (error.status === 429) return "Trop de requêtes envoyées. Patientez quelques secondes puis réessayez.";
    return `TheCatAPI a répondu avec une erreur (HTTP ${error.status}). Réessayez dans un instant.`;
  }
  if (error instanceof TypeError) return "Connexion impossible. Vérifiez votre accès à Internet.";
  return "Une erreur inattendue est survenue.";
}
