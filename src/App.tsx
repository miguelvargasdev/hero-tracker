import { useHeroStore } from "./store/useHeroStore";
import { MainMenu } from "./components/menu/MainMenu";
import { PlayerSelect } from "./components/menu/PlayerSelect";
import { TyrantPlayerSelect } from "./components/menu/TyrantPlayerSelect";
import { GameView } from "./components/game/GameView";
import { HeroDetail } from "./components/hero/HeroDetail";
import { InstallPrompt } from "./components/InstallPrompt";
import { ViewTransitionProvider } from "./hooks/ViewTransitionProvider";

function App() {
  const activeView = useHeroStore((s) => s.activeView);

  const view = (() => {
    switch (activeView) {
      case "main-menu":
        return <MainMenu />;
      case "player-select":
        return <PlayerSelect />;
      case "tyrant-select":
        return <TyrantPlayerSelect />;
      case "game":
        return <GameView />;
      case "hero-detail":
        return <HeroDetail />;
    }
  })();

  return (
    <ViewTransitionProvider>
      {view}
      {activeView === "main-menu" && <InstallPrompt />}
    </ViewTransitionProvider>
  );
}

export default App;
