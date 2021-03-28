import {
  gameStoreObservable,
  leaveGame,
  makeTurn,
  startGame
} from "../../observables/game-actions";
import { load } from "../../util/load";

import { Board } from "../board";
import styled from "@emotion/styled";
import { profile } from "../../observables/auth";

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

function InnerGame({ game }) {
  const { ownBoard, enemyBoard, current, waiting } = game;

  return (
    <Layout>
      <Header>Turn of the player: {current}</Header>
      <div>
        <div>
          <div>You</div>
          <Board data={ownBoard.cells} onClick={() => {}} />
          <div>Other player({waiting})</div>
          <Board
            data={enemyBoard.cells}
            onClick={(row, column) => makeTurn(game.id, { y: row, x: column })}
          />
        </div>
      </div>
    </Layout>
  );
}

export function Game() {
  const isGameInProgress = (state) => state === "playerTurn";
  const isGameOver = (state) => state === "finished" || state === "destroyed";

  return (
    <div>
      Game Screen
      <div>
        {load(gameStoreObservable, {
          render(game) {
            const { id, state, winnerId } = game;
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
                  id: {id}, state: {state}
                </div>
                {state === "awaitingStart" && startButton}
                {!isGameOver(state) && leaveButton}
                {winnerId !== null && <h3>Game over, {winnerId} wins!</h3>}
                {isGameInProgress(state) && <InnerGame game={game} />}
              </>
            );
          }
        })}
      </div>
    </div>
  );
}
