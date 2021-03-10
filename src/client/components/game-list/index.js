import {
  gamesListObservable,
  gameStoreObservable,
  fetchGamesList,
  createGame
} from "../../observables/game-actions";
import { useEffect } from "react";
import { useObservable } from "../../hooks/use-observable";

export function GameList() {
  const gamesList = useObservable(gamesListObservable);
  const game = useObservable(gameStoreObservable);

  console.log("gamesList", gamesList);
  console.log("game", game);

  const onCreateNewButtonClick = () => {
    createGame();
  };
  const onRefrestGamesButtonClick = () => {
    fetchGamesList();
  };

  useEffect(() => {
    fetchGamesList();
  }, []);

  return (
    <div>
      <h2>Game list</h2>
      <div>
        <button type="button" onClick={onCreateNewButtonClick}>
          Create New Game
        </button>
        <button type="button" onClick={onRefrestGamesButtonClick}>
          Refresh
        </button>
      </div>
      <div>...</div>
    </div>
  );
}
