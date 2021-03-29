import { gameStoreObservable } from "./game-actions";
import { otherPlayerObservable } from "./other-player";
import { profileObservable } from "./auth";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { compareStatuses } from "../util/compare-statuses";

// TODO: reset when player(s) left or logout
export const gameInfoObservable = combineLatest([
  gameStoreObservable,
  otherPlayerObservable,
  profileObservable
]).pipe(
  map((items) => {
    const statuses = items.map(({ status }) => status).sort(compareStatuses);
    const commonStatus = statuses[0];

    return { status: commonStatus, value: items.map(({ value }) => value) };
  }),
  map((state) => {
    if (state.status === "success") {
      const [game, otherPlayer, profile] = state.value;

      return {
        ...state,
        value: {
          game,
          players: {
            [otherPlayer.id]: otherPlayer.name,
            [profile.id]: profile.name
          }
        }
      };
    }

    return state;
  })
);

gameInfoObservable.subscribe((...args) => {
  console.log("Full game info:", ...args);
});
