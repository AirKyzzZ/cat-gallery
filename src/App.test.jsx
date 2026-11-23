import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as catApi from "./services/catApi.js";
import { ApiError } from "./services/apiError.js";
import { bengal, breeds, makeImage, persian } from "./test/fixtures.js";
import { renderApp } from "./test/renderApp.jsx";

vi.mock("./services/catApi.js", () => ({
  getBreeds: vi.fn(),
  searchImages: vi.fn(),
  getRandomImage: vi.fn(),
  getFavourites: vi.fn(),
  addFavourite: vi.fn(),
  removeFavourite: vi.fn(),
  getVotes: vi.fn(),
  addVote: vi.fn(),
}));

const api = vi.mocked(catApi);

const page = (prefix, count, breed) => Array.from({ length: count }, (_, i) => makeImage(`${prefix}${i}`, breed));

beforeEach(() => {
  vi.resetAllMocks();
  api.getBreeds.mockResolvedValue(breeds);
  api.getFavourites.mockResolvedValue([]);
  api.searchImages.mockResolvedValue({ images: page("img", 12), total: 30 });
  api.getVotes.mockResolvedValue([]);
});

describe("navigation", () => {
  it("renders the gallery on the home page and highlights the active link", async () => {
    renderApp("/");
    expect(await screen.findByRole("heading", { level: 1, name: "Des chats, encore des chats" })).toBeInTheDocument();
    expect(await screen.findAllByRole("button", { name: /Agrandir la photo/ })).toHaveLength(12);
    expect(screen.getByRole("link", { name: "Galerie" })).toHaveClass("active");
    expect(document.title).toBe("Galerie · Cat Gallery");
  });

  it("navigates between pages from the header", async () => {
    const { user } = renderApp("/");
    await user.click(screen.getByRole("link", { name: "Races" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Toutes les races" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Races" })).toHaveClass("active");
  });

  it("shows a 404 page for unknown routes", async () => {
    renderApp("/chiens");
    expect(screen.getByRole("heading", { name: "Ce chat s'est échappé" })).toBeInTheDocument();
    expect(screen.getByText("/chiens")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Retour à la galerie" })).toHaveAttribute("href", "/");
  });
});

describe("gallery", () => {
  it("loads more photos on demand", async () => {
    api.searchImages
      .mockResolvedValueOnce({ images: page("a", 12), total: 15 })
      .mockResolvedValueOnce({ images: page("b", 3), total: 15 });
    const { user } = renderApp("/");

    await user.click(await screen.findByRole("button", { name: "Voir plus de chats" }));

    await waitFor(() => expect(screen.getAllByRole("button", { name: /Agrandir la photo/ })).toHaveLength(15));
    expect(api.searchImages).toHaveBeenLastCalledWith({ breedId: "", page: 1, limit: 12 });
    expect(screen.queryByRole("button", { name: "Voir plus de chats" })).not.toBeInTheDocument();
    expect(screen.getByText("15 photos sur 15")).toBeInTheDocument();
  });

  it("filters by breed through the URL and shows a breed summary", async () => {
    const { user, router } = renderApp("/");
    const select = await screen.findByRole("combobox", { name: "Race" });
    await waitFor(() => expect(select).toBeEnabled());

    await user.selectOptions(select, "beng");

    expect(router.state.location.search).toBe("?race=beng");
    expect(await screen.findByRole("region", { name: "Race sélectionnée : Bengal" })).toBeInTheDocument();
    await waitFor(() => expect(api.searchImages).toHaveBeenLastCalledWith({ breedId: "beng", page: 0, limit: 12 }));
  });

  it("shows a friendly error with a retry button", async () => {
    api.searchImages.mockRejectedValueOnce(new ApiError(500, "/images/search"));
    const { user } = renderApp("/");

    expect(await screen.findByText(/HTTP 500/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Réessayer" }));

    expect(await screen.findAllByRole("button", { name: /Agrandir la photo/ })).toHaveLength(12);
  });

  it("opens a lightbox navigable with the keyboard", async () => {
    const { user } = renderApp("/");
    const thumbnails = await screen.findAllByRole("button", { name: /Agrandir la photo/ });

    await user.click(thumbnails[0]);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Chat Bengal, photo 1 sur 12");
    expect(within(dialog).getByRole("button", { name: "Fermer" })).toHaveFocus();
    expect(within(dialog).queryByRole("button", { name: "Photo précédente" })).not.toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Chat Bengal, photo 2 sur 12");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(thumbnails[1]).not.toHaveFocus();
    expect(thumbnails[0]).toHaveFocus();
  });

  it("keeps keyboard focus inside the lightbox", async () => {
    api.searchImages.mockResolvedValueOnce({ images: page("img", 2), total: 2 });
    const { user } = renderApp("/");
    await user.click((await screen.findAllByRole("button", { name: /Agrandir la photo/ }))[0]);
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Photo suivante" }));
    expect(within(dialog).queryByRole("button", { name: "Photo suivante" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Fermer" })).toHaveFocus();

    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement);
    for (let i = 0; i < 5; i += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement);
    }
  });

  it("disables favourite buttons until the saved favourites are known", async () => {
    api.getFavourites.mockReturnValueOnce(new Promise(() => {}));
    renderApp("/");
    const hearts = await screen.findAllByRole("button", { name: "Ajouter aux favoris" });
    expect(hearts[0]).toBeDisabled();
  });
});

describe("favourites", () => {
  it("adds a photo to favourites and lists it on the favourites page", async () => {
    api.addFavourite.mockResolvedValueOnce({ id: 99 });
    const { user } = renderApp("/");
    const [firstHeart] = await screen.findAllByRole("button", { name: "Ajouter aux favoris" });

    await user.click(firstHeart);

    await waitFor(() => expect(firstHeart).toHaveAttribute("aria-pressed", "true"));
    expect(api.addFavourite).toHaveBeenCalledWith("img0", expect.any(String));
    const favouritesLink = screen.getByRole("link", { name: /Favoris/ });
    expect(favouritesLink).toHaveTextContent("1");

    await user.click(favouritesLink);
    expect(await screen.findByRole("heading", { level: 1, name: "Vos chats préférés" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Agrandir la photo/ })).toHaveLength(1);
  });

  it("invites the user to explore when there is no favourite", async () => {
    renderApp("/favoris");
    expect(await screen.findByRole("heading", { name: "Aucun favori pour l'instant" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorer la galerie" })).toHaveAttribute("href", "/");
  });

  it("surfaces a dismissible alert when saving fails", async () => {
    api.addFavourite.mockRejectedValueOnce(new ApiError(429, "/favourites"));
    const { user } = renderApp("/");
    const [firstHeart] = await screen.findAllByRole("button", { name: "Ajouter aux favoris" });

    await user.click(firstHeart);

    expect(await screen.findByRole("alert")).toHaveTextContent("Trop de requêtes");
    await user.click(screen.getByRole("button", { name: "Fermer le message" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("breeds", () => {
  it("searches breeds and keeps the query in the URL", async () => {
    const { user, router } = renderApp("/races");
    expect(await screen.findByText("3 races")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox"), "pers");

    expect(screen.getByText("1 race")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Persian/ })).toHaveAttribute("href", "/races/pers");
    expect(router.state.location.search).toBe("?q=pers");
  });

  it("clears the search when navigating back to the plain breeds page", async () => {
    const { user, router } = renderApp("/races?q=pers");
    expect(await screen.findByText("1 race")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("pers");

    await user.click(screen.getByRole("link", { name: "Races" }));

    expect(router.state.location.search).toBe("");
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByText("3 races")).toBeInTheDocument();
  });

  it("filters by coat and resets the filters", async () => {
    const { user } = renderApp("/races");
    await user.selectOptions(await screen.findByRole("combobox", { name: "Pelage" }), "Sans poil");

    expect(screen.getByText("1 race")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sphynx/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Réinitialiser les filtres" }));
    expect(screen.getByText("3 races")).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    const { user } = renderApp("/races");
    await user.type(await screen.findByRole("searchbox"), "dragon");
    expect(screen.getByRole("heading", { name: "Aucune race ne correspond" })).toBeInTheDocument();
  });

  it("lets the user retry when breeds fail to load", async () => {
    api.getBreeds.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { user } = renderApp("/races");

    expect(await screen.findByText(/Connexion impossible/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Réessayer" }));

    expect(await screen.findByText("3 races")).toBeInTheDocument();
    expect(api.getBreeds).toHaveBeenCalledTimes(2);
  });

  it("renders a breed detail page with its stats and photos", async () => {
    api.searchImages.mockResolvedValue({ images: page("b", 2, bengal), total: 2 });
    renderApp("/races/beng");

    expect(await screen.findByRole("heading", { level: 1, name: "Bengal" })).toBeInTheDocument();
    expect(screen.getByText("12 à 16 ans")).toBeInTheDocument();
    expect(screen.getByText("3,6 à 7 kg")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Histoire" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir dans la galerie" })).toHaveAttribute("href", "/?race=beng");
    expect(await screen.findAllByRole("button", { name: /Agrandir la photo/ })).toHaveLength(2);
    expect(api.searchImages).toHaveBeenCalledWith({ breedId: "beng", page: 0, limit: 12 });
    expect(document.title).toBe("Bengal · Cat Gallery");
  });

  it("explains when a breed does not exist", async () => {
    renderApp("/races/licorne");
    expect(await screen.findByRole("heading", { name: "Race introuvable" })).toBeInTheDocument();
    expect(screen.getByText(/licorne/)).toBeInTheDocument();
  });
});

describe("vote", () => {
  beforeEach(() => {
    api.getRandomImage
      .mockResolvedValueOnce(makeImage("first", bengal))
      .mockResolvedValueOnce(makeImage("second", persian))
      .mockResolvedValueOnce(makeImage("third", bengal));
  });

  it("records a like, shows the next cat and updates the history", async () => {
    api.addVote.mockResolvedValueOnce({ id: 1 });
    const { user } = renderApp("/vote");

    expect(await screen.findByRole("img", { name: "Chat Bengal" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "J'aime" }));

    expect(api.addVote).toHaveBeenCalledWith("first", expect.any(String), 1);
    expect(await screen.findByRole("img", { name: "Chat Persian" })).toBeInTheDocument();
    expect(screen.getByText("1 j'aime")).toBeInTheDocument();
    const history = screen.getByRole("complementary", { name: "Historique des votes" });
    expect(within(history).getAllByRole("listitem")).toHaveLength(1);
  });

  it("supports keyboard shortcuts", async () => {
    api.addVote.mockResolvedValue({ id: 2 });
    const { user } = renderApp("/vote");
    await screen.findByRole("img", { name: "Chat Bengal" });

    await user.keyboard("{ArrowLeft}");

    expect(api.addVote).toHaveBeenCalledWith("first", expect.any(String), -1);
    expect(await screen.findByText("1 bof")).toBeInTheDocument();
  });

  it("ignores arrows combined with a modifier, like the browser back shortcut", async () => {
    const { user } = renderApp("/vote");
    await screen.findByRole("img", { name: "Chat Bengal" });

    await user.keyboard("{Alt>}{ArrowLeft}{/Alt}{Meta>}{ArrowRight}{/Meta}");

    expect(api.addVote).not.toHaveBeenCalled();
  });

  it("skips a cat without voting", async () => {
    const { user } = renderApp("/vote");
    await screen.findByRole("img", { name: "Chat Bengal" });

    await user.click(screen.getByRole("button", { name: "Passer" }));

    expect(await screen.findByRole("img", { name: "Chat Persian" })).toBeInTheDocument();
    expect(api.addVote).not.toHaveBeenCalled();
  });

  it("restores the history thumbnails of previous sessions", async () => {
    localStorage.setItem("cat-gallery:vote-thumbnails", JSON.stringify({ old: "https://cdn/old.jpg" }));
    api.getVotes.mockResolvedValueOnce([
      { id: 5, image_id: "old", value: 1 },
      { id: 6, image_id: "unknown", value: -1 },
    ]);
    renderApp("/vote");

    expect(await screen.findByText("1 j'aime")).toBeInTheDocument();
    expect(screen.getByText("1 bof")).toBeInTheDocument();
    const history = screen.getByRole("complementary", { name: "Historique des votes" });
    expect(within(history).getAllByRole("listitem")).toHaveLength(1);
  });
});
