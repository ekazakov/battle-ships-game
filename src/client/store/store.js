import { BehaviorSubject, Subject } from "rxjs";
import { distinctUntilKeyChanged, scan, pluck } from "rxjs/operators";

const defaultReducer = (acc, curr, index) => ({ ...acc, ...curr });

export class Store {
  constructor(initialState, reducer = defaultReducer) {
    this._store = new BehaviorSubject(initialState);
    this._stateUpdate = new Subject();

    this._subs = this._stateUpdate
      .pipe(scan(reducer, initialState))
      .subscribe(this._store);
  }

  selectState(key) {
    return this._store.pipe(distinctUntilKeyChanged(key), pluck(key));
  }

  updateState(newState) {
    this._stateUpdate.next(newState);
  }

  stateChanges() {
    return this._store.asObservable();
  }

  complete() {
    this._stateUpdate.complete();
  }

  add(subscription) {
    this._subs.add(subscription);
  }
}
