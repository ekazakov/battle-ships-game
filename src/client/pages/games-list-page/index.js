import {
  gamesListObservable,
  gameStoreObservable,
  fetchGamesList,
  createGame,
  joinGame
} from "../../observables/game-actions";
import { useEffect } from "react";
import { useObservable } from "../../hooks/use-observable";
import { load } from "../../util/load";
import { authObservable, isAuthorized, profile } from "../../observables/auth";
import { PageLayout } from "../../components/page-layout";

function Item({ game }) {
  const authState = useObservable(authObservable);
  const onJoinClick = async () => {
    await joinGame(game.id);
    await profile();
  };

  const showJoinButton =
    isAuthorized(authState) &&
    authState.user.id !== game.ownerId &&
    game.state === "awaiting";
  const startButton = <button onClick={onJoinClick}>Join</button>;

  return (
    <li>
      Game: <b>{game.id}</b> created by <b>{game.ownerId}</b> status:{" "}
      {game.state} {showJoinButton && startButton}
    </li>
  );
}

export function GameListPage() {
  const game = useObservable(gameStoreObservable);

  console.log("game", game);

  const onCreateNewButtonClick = async () => {
    await createGame();
    await profile();
  };
  const onRefreshGamesButtonClick = () => {
    fetchGamesList();
  };

  useEffect(() => {
    fetchGamesList();
  }, []);

  return (
    <PageLayout>
      <h2>Game list</h2>
      <div>
        <button type="button" onClick={onCreateNewButtonClick}>
          Create New Game
        </button>
        <button type="button" onClick={onRefreshGamesButtonClick}>
          Refresh
        </button>
      </div>
      <div>
        {load(gamesListObservable, {
          render(list) {
            return (
              <div>
                <div>Total Games: {list.length}</div>
                <ul>
                  {list.map((game) => (
                    <Item key={game.id} game={game} />
                  ))}
                </ul>
              </div>
            );
          }
        })}
      </div>
    </PageLayout>
  );
}
