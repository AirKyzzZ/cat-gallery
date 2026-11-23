import { isRouteErrorResponse, useRouteError } from "react-router";
import { ErrorState } from "../components/StatusViews.jsx";

export default function ErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Une erreur inattendue a interrompu l'affichage de cette page.";

  return <ErrorState message={message} onRetry={() => window.location.reload()} />;
}
