import { BehaviorSubject } from "rxjs";
import { Store } from "../store/store";

const gamesListSubject = new BehaviorSubject({
  status: "idle",
  value: null
});

export const gamesListObservable = gamesListSubject.asObservable();

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

export function fetchGamesList() {
  gamesListSubject.next({
    status: "loading",
    value: null,
    error: null
  });

  return fetch("/api/game/list", {
    method: "GET",
    headers
  })
    .then((response) =>
      response.json().then((data) => {
        if (response.ok) {
          gamesListSubject.next({
            status: "success",
            value: data,
            error: null
          });
        } else {
          throw data;
        }
      })
    )
    .catch((error) =>
      gamesListSubject.next({
        value: null,
        status: "failure",
        error
      })
    );
}

export const GameAction = {
  INIT: "INIT",
  GAME_CREATION_STARTED: "GAME_CREATION_STARTED",
  GAME_CREATION_FAILED: "GAME_CREATION_FAILED",
  GAME_CREATION_SUCCESS: "GAME_CREATED"
};

function gameReducer(state, action) {
  switch (action.type) {
    case GameAction.GAME_CREATION_STARTED:
      return { ...state, status: "loading", error: null };
    case GameAction.GAME_CREATION_FAILED:
      return { ...state, status: "failure", error: action.error };
    case GameAction.GAME_CREATION_SUCCESS:
      return {
        ...state,
        currentGame: action.payload,
        status: "success",
        error: null
      };
    default:
      return state;
  }
}

const gameStore = new Store(
  { currentGame: {}, status: "idle", error: null },
  gameReducer
);

export const gameStoreObservable = gameStore.stateChanges();

export function createGame() {
  gameStore.updateState({ type: GameAction.GAME_CREATION_STARTED });

  return fetch("/api/game/create", { method: "POST" })
    .then((response) =>
      response.json().then((data) => {
        if (response.ok) {
          gameStore.updateState({
            type: GameAction.GAME_CREATION_SUCCESS,
            payload: data,
            error: null
          });
        } else {
          throw data;
        }
      })
    )
    .catch((error) =>
      gameStore.updateState({
        type: GameAction.GAME_CREATION_FAILED,
        payload: null,
        error
      })
    );
}
