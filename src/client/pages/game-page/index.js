import {
  gameStoreObservable,
  leaveGame,
  makeTurn,
  startGame
} from "../../observables/game-actions";
import { load } from "../../util/load";

import { Board } from "../../components/board";
import styled from "@emotion/styled";
import { profile } from "../../observables/auth";
import { gameInfoObservable } from "../../observables/game-info";
import { PageLayout } from "../../components/page-layout";

const Layout = styled.div`
  grid-template-columns: repeat(2, minmax(330px, 500px));
  justify-content: center;
  justify-items: center;
`;

const Header = styled.div`
  font-size: 24px;
  font-weight: bold;
  grid-column: span 2;
`;

const isGameInProgress = (state) => state === "playerTurn";
const isGameOver = (state) => state === "finished" || state === "destroyed";
const isGameFinished = (state) => state === "finished";

function InnerGame() {
  return (
    <Layout>
      {load(gameInfoObservable, {
        render({ game, players }) {
          const {
            ownBoard,
            enemyBoard,
            winnerId,
            current,
            ownId,
            enemyId,
            state
          } = game;
          const ownPlayer = players[ownId];
          const enemyPlayer = players[enemyId];
          const currentPlayer = players[current];

          if (isGameFinished(state)) {
            return <h3>Game over, {players[winnerId]} won!</h3>;
          } else if (isGameInProgress(state)) {
            return (
              <>
                <Header>Turn of the player: {currentPlayer}</Header>
                <div>
                  <div>
                    <div>You ({ownPlayer})</div>
                    <Board data={ownBoard.cells} onClick={() => {}} />
                    <div>Other player({enemyPlayer})</div>
                    <Board
                      data={enemyBoard.cells}
                      onClick={(row, column) =>
                        makeTurn(game.id, { y: row, x: column })
                      }
                    />
                  </div>
                </div>
              </>
            );
          }
        },

        renderIdle() {
          return <b>Awaiting game start</b>;
        }
      })}
    </Layout>
  );
}

export function GamePage() {
  return (
    <PageLayout>
      <div>
        {load(gameStoreObservable, {
          render(game) {
            const { id, state } = game;
            const onLeaveGameClick = async () => {
              await leaveGame(id);
              await profile();
            };
            const startButton = (
              <button onClick={() => startGame(id)}>Start game</button>
            );
            const leaveButton = (
              <button onClick={onLeaveGameClick}>Leave game</button>
            );

            return (
              <>
                <div>
                  Game: {id}, state: {state}
                </div>
                {state === "awaitingStart" && startButton}
                {!isGameOver(state) && leaveButton}
                <InnerGame />
              </>
            );
          },
          renderIdle() {
            return <div>No active game found</div>;
          }
        })}
      </div>
    </PageLayout>
  );
}
