import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { HealthCounter } from "./HealthCounter";
import { useHeroStore } from "../../store/useHeroStore";
import type { Hero } from "../../types/hero";

function resetStore() {
	useHeroStore.setState({
		heroes: [],
		activeHeroId: null,
		activeView: "main-menu",
		gameMode: null,
		resetCounter: 0,
	});
}

function selectedHero(templateId = "arcanas"): Hero {
	useHeroStore.getState().startGame("standard", 1);
	const heroId = useHeroStore.getState().heroes[0].id;
	useHeroStore.getState().selectHero(heroId, templateId);
	return useHeroStore.getState().heroes[0];
}

// isClickIncr needs a non-zero rect; jsdom's getBoundingClientRect defaults
// to all zeros, so every test stubs a 200x400 card.
function stubCardRect(container: HTMLElement) {
	const card = container.firstChild as HTMLElement;
	card.getBoundingClientRect = () =>
		({ width: 200, height: 400, left: 0, top: 0 }) as DOMRect;
	return card;
}

describe("HealthCounter", () => {
	beforeEach(() => {
		resetStore();
	});

	it("tapping the top half increments HP", () => {
		const hero = selectedHero();
		const { container } = render(
			<HealthCounter hero={hero} onSelect={vi.fn()} />,
		);
		const card = stubCardRect(container);

		fireEvent.click(card, { clientX: 100, clientY: 50 }); // y < h/2 -> increment

		const updated = useHeroStore.getState().heroes[0];
		expect(updated.hp.current).toBe(hero.hp.current + 1);
	});

	it("tapping the bottom half decrements HP", () => {
		const hero = selectedHero();
		const { container } = render(
			<HealthCounter hero={hero} onSelect={vi.fn()} />,
		);
		const card = stubCardRect(container);

		fireEvent.click(card, { clientX: 100, clientY: 350 }); // y > h/2 -> decrement

		const updated = useHeroStore.getState().heroes[0];
		expect(updated.hp.current).toBe(hero.hp.current - 1);
	});

	it("respects rotation when deciding increment vs decrement", () => {
		const hero = selectedHero();
		const { container } = render(
			<HealthCounter hero={hero} rotation={90} onSelect={vi.fn()} />,
		);
		const card = stubCardRect(container);

		// At 90deg, the right half increments (see healthCounterUtils.isClickIncr).
		fireEvent.click(card, { clientX: 150, clientY: 200 });

		const updated = useHeroStore.getState().heroes[0];
		expect(updated.hp.current).toBe(hero.hp.current + 1);
	});

	it("only updates the tapped hero, not others in the same game", () => {
		useHeroStore.getState().startGame("standard", 2);
		const [id1, id2] = useHeroStore.getState().heroes.map((h) => h.id);
		useHeroStore.getState().selectHero(id1, "arcanas");
		useHeroStore.getState().selectHero(id2, "darren");
		const hero1 = useHeroStore.getState().heroes[0];

		const { container } = render(
			<HealthCounter hero={hero1} onSelect={vi.fn()} />,
		);
		const card = stubCardRect(container);
		fireEvent.click(card, { clientX: 100, clientY: 50 });

		const heroes = useHeroStore.getState().heroes;
		expect(heroes[0].hp.current).toBe(hero1.hp.current + 1);
		expect(heroes[1].hp.current).toBe(32); // Darren's untouched hp
	});

	it("calls onSelect instead of changing HP when the slot is unselected", () => {
		useHeroStore.getState().startGame("standard", 1);
		const hero = useHeroStore.getState().heroes[0];
		const onSelect = vi.fn();

		const { container } = render(
			<HealthCounter hero={hero} onSelect={onSelect} />,
		);
		const card = stubCardRect(container);
		fireEvent.click(card, { clientX: 100, clientY: 50 });

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(useHeroStore.getState().heroes[0].hp.current).toBe(0);
	});
});
