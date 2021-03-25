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
  GAME_CREATION_SUCCESS: "GAME_CREATION_SUCCESS",

  GAME_JOIN_STARTED: "GAME_JOIN_STARTED",
  GAME_JOIN_FAILED: "GAME_JOIN_FAILED",
  GAME_JOIN_SUCCESS: "GAME_JOIN_SUCCESS"
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

export function joinGame(id) {
  gameStore.updateState({ type: GameAction.GAME_JOIN_FAILED });
  return fetch(`/api/game/${id}/join`, { method: "POST" })
    .then((response) =>
      response.json().then((data) => {
        if (response.ok) {
          gameStore.updateState({
            type: GameAction.GAME_JOIN_SUCCESS,
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
        type: GameAction.GAME_JOIN_FAILED,
        payload: null,
        error
      })
    );
}

let gameUpdatesSource = null;

export function subscribeOnGame(id) {
  gameUpdatesSource?.close();
  gameUpdatesSource = new EventSource(`/api/game/${id}/subscribe`);

  gameUpdatesSource.onopen = (evt) => {
    console.log("subscription ready", evt);
  };

  gameUpdatesSource.onmessage = (evt) => {
    console.log("message", evt);
  };

  gameUpdatesSource.onerror = (error) => {
    console.log("subscription error", error);
  };
}

export function stopSubscription() {
  gameUpdatesSource?.close();
}
