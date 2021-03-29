import { createApiObservable } from "../util/api-observable";
import { gameStoreObservable } from "./game-actions";
import { distinct, skipWhile } from "rxjs/operators";

const { sendRequest, observable } = createApiObservable();

export const otherPlayerObservable = observable;
export const getOtherPlayer = (id) =>
  sendRequest(`/api/game/${id}/other_player`);

const gameStarted$ = gameStoreObservable.pipe(
  skipWhile(({ status }) => status !== "success"),
  skipWhile(({ value }) => value?.secondPlayerId === null),
  distinct(({ value }) => value.secondPlayerId)
);

gameStarted$.subscribe(({ value: game }) => {
  console.log(`Fetching other player for game: ${game.id}`);
  getOtherPlayer(game.id);
});
