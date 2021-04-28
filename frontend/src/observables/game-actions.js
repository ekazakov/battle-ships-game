import { BehaviorSubject } from "rxjs";
import { Store } from "../store/store";
import { authStoreObservable } from "./auth";
import { distinctUntilChanged, map } from "rxjs/operators";
import { baseUrl } from "../util/constants";

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

  return fetch(baseUrl + "/api/game/list", {
    method: "GET",
    headers,
    credentials: "include"
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
  GAME_UPDATE_STARTED: "GAME_UPDATE_STARTED",
  GAME_UPDATE_FAILED: "GAME_UPDATE_FAILED",
  GAME_UPDATE_SUCCESS: "GAME_UPDATE_SUCCESS"
};

function gameReducer(state, action) {
  switch (action.type) {
    case GameAction.GAME_UPDATE_STARTED:
      return { ...state, status: "loading", error: null };
    case GameAction.GAME_UPDATE_FAILED:
      return { ...state, status: "failure", error: action.error };
    case GameAction.GAME_UPDATE_SUCCESS:
      return {
        ...state,
        value: action.payload,
        status: "success",
        error: null
      };
    default:
      return state;
  }
}

const gameStore = new Store(
  { value: {}, status: "idle", error: null },
  gameReducer
);

export const gameStoreObservable = gameStore.stateChanges();

export function createGame() {
  gameStore.updateState({ type: GameAction.GAME_UPDATE_STARTED });

  return fetch(baseUrl + "/api/game/create", {
    method: "POST",
    credentials: "include"
  })
    .then((response) =>
      response.json().then((data) => {
        if (response.ok) {
          gameStore.updateState({
            type: GameAction.GAME_UPDATE_SUCCESS,
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
        type: GameAction.GAME_UPDATE_FAILED,
        payload: null,
        error
      })
    );
}

export function joinGame(id) {
  gameStore.updateState({ type: GameAction.GAME_UPDATE_STARTED });
  return fetch(baseUrl + `/api/game/${id}/join`, {
    method: "POST",
    credentials: "include"
  })
    .then((response) =>
      response.json().then((data) => {
        if (response.ok) {
          gameStore.updateState({
            type: GameAction.GAME_UPDATE_SUCCESS,
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
        type: GameAction.GAME_UPDATE_FAILED,
        payload: null,
        error
      })
    );
}

export function startGame(id) {
  return fetch(baseUrl + `/api/game/${id}/start`, {
    method: "POST",
    credentials: "include"
  }).then((response) =>
    response.json().then((data) => {
      if (response.ok) {
        return data;
      } else {
        throw data;
      }
    })
  );
}

export function makeTurn(id, target) {
  return fetch(baseUrl + `/api/game/${id}/turn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(target),
    credentials: "include"
  }).then((response) =>
    response.json().then((data) => {
      if (response.ok) {
        return data;
      } else {
        throw data;
      }
    })
  );
}

export function leaveGame(id) {
  return fetch(baseUrl + `/api/game/${id}/leave`, {
    method: "POST",
    credentials: "include"
  }).then((response) =>
    response.json().then((data) => {
      if (response.ok) {
        return data;
      } else {
        throw data;
      }
    })
  );
}

let gameUpdatesSource = null;

const gameId$ = authStoreObservable
  .pipe(map((value) => value?.user?.gameId))
  .pipe(distinctUntilChanged());

gameId$.subscribe((gameId) => {
  if (gameId) {
    startGameUpdatesSubscription(gameId);
  }
});

export function startGameUpdatesSubscription(id) {
  gameUpdatesSource?.close();
  gameUpdatesSource = new EventSource(baseUrl + `/api/game/${id}/subscribe`, {
    withCredentials: true
  });

  gameUpdatesSource.onopen = (evt) => {
    console.log("subscription ready", evt);
  };

  gameUpdatesSource.onmessage = (evt) => {
    gameStore.updateState({
      type: GameAction.GAME_UPDATE_SUCCESS,
      payload: JSON.parse(evt.data),
      error: null
    });
  };

  gameUpdatesSource.onerror = (error) => {
    console.log("subscription error", error);
  };
}

export function stopSubscription() {
  gameUpdatesSource?.close();
}
