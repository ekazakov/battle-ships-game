import { createApiObservable } from "../util/api-observable";
import { gameStoreObservable } from "./game-actions";
import { distinct, pluck, skipWhile } from "rxjs/operators";

const { sendRequest, observable } = createApiObservable();

export const otherPlayerObservable = observable;
export const getUser = (id) => sendRequest(`/api/game/${id}/other_player`);

const gameStarted$ = gameStoreObservable.pipe(
  // TODO: change status filter
  skipWhile(({ status }) => status !== "success"),
  pluck(...["value", "secondPlayerId"]),
  distinct()
);

// TODO: handle case for second player,
gameStarted$.subscribe((secondPlayerId) => {
  throw Error("TODO: handle case for second player");
  // TODO: use gameId to fetch other player
  console.log("SecondPlayerId:", secondPlayerId);
  // if (secondPlayerId) {
  //   getUser(secondPlayerId);
  // }
});
