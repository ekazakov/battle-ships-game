import { subscribeOnGame } from "../../observables/game-actions";
import { useEffect } from "react";

export function Game() {
  useEffect(() => {
    subscribeOnGame("game_1");
  }, []);
  return <div>Game Screen</div>;
}
