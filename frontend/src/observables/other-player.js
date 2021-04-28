import { createApiObservable } from "../util/api-observable";
import { gameStoreObservable } from "./game-actions";
import { distinct, skipWhile } from "rxjs/operators";
import { baseUrl } from "../util/constants";

const { sendRequest, subject } = createApiObservable();

export const otherPlayerObservable = subject.asObservable();

export const getOtherPlayer = (id) =>
  sendRequest(baseUrl + `/api/game/${id}/other_player`);

const gameStarted$ = gameStoreObservable.pipe(
  skipWhile(({ status }) => status !== "success"),
  skipWhile(({ value }) => value?.enemyId === null),
  distinct(({ value }) => value.enemyId)
);

gameStarted$.subscribe(({ value: game }) => {
  console.log(`Fetching other player for game: ${game.id}`);
  getOtherPlayer(game.id);
});
