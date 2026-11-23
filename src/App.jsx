import { RouterProvider } from "react-router/dom";
import AppProviders from "./context/AppProviders.jsx";

export default function App({ router }) {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
