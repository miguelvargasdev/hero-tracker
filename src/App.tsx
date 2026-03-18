import { useHeroStore } from "./store/useHeroStore";
import { MainMenu } from "./components/menu/MainMenu";
import { PlayerSelect } from "./components/menu/PlayerSelect";
import { GameView } from "./components/game/GameView";
import { HeroDetail } from "./components/hero/HeroDetail";

function App() {
  const activeView = useHeroStore((s) => s.activeView);

  switch (activeView) {
    case "main-menu":
      return <MainMenu />;
    case "player-select":
      return <PlayerSelect />;
    case "game":
      return <GameView />;
    case "hero-detail":
      return <HeroDetail />;
  }
}

export default App;
