import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { useHeroStore } from "./store/useHeroStore";

vi.mock("./components/menu/MainMenu", () => ({
	MainMenu: () => <div data-testid="main-menu" />,
}));
vi.mock("./components/menu/PlayerSelect", () => ({
	PlayerSelect: () => <div data-testid="player-select" />,
}));
vi.mock("./components/menu/TyrantPlayerSelect", () => ({
	TyrantPlayerSelect: () => <div data-testid="tyrant-select" />,
}));
vi.mock("./components/game/GameView", () => ({
	GameView: () => <div data-testid="game-view" />,
}));
vi.mock("./components/hero/HeroDetail", () => ({
	HeroDetail: () => <div data-testid="hero-detail" />,
}));
vi.mock("./components/InstallPrompt", () => ({
	InstallPrompt: () => <div data-testid="install-prompt" />,
}));

function setView(view: ReturnType<typeof useHeroStore.getState>["activeView"]) {
	useHeroStore.setState({ activeView: view });
}

describe("App", () => {
	beforeEach(() => {
		useHeroStore.setState({ activeView: "main-menu" });
	});

	it("renders MainMenu (and InstallPrompt) for the main-menu view", () => {
		setView("main-menu");
		render(<App />);
		expect(screen.getByTestId("main-menu")).toBeInTheDocument();
		expect(screen.getByTestId("install-prompt")).toBeInTheDocument();
		expect(screen.queryByTestId("player-select")).not.toBeInTheDocument();
	});

	it("renders PlayerSelect for the player-select view, without InstallPrompt", () => {
		setView("player-select");
		render(<App />);
		expect(screen.getByTestId("player-select")).toBeInTheDocument();
		expect(screen.queryByTestId("install-prompt")).not.toBeInTheDocument();
	});

	it("renders TyrantPlayerSelect for the tyrant-select view", () => {
		setView("tyrant-select");
		render(<App />);
		expect(screen.getByTestId("tyrant-select")).toBeInTheDocument();
	});

	it("renders GameView for the game view", () => {
		setView("game");
		render(<App />);
		expect(screen.getByTestId("game-view")).toBeInTheDocument();
	});

	it("renders HeroDetail for the hero-detail view", () => {
		setView("hero-detail");
		render(<App />);
		expect(screen.getByTestId("hero-detail")).toBeInTheDocument();
	});
});
