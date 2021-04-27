import { useState, useEffect, useMemo, useCallback } from "react";

const emptyValueTag = Symbol("useObservableEmptyValueTag");
export const emptyValue = { [emptyValueTag]: true };

export function isEmptyValue(value) {
  return value === emptyValue;
}

export function useUpdate() {
  const [, setTick] = useState(Number.MAX_SAFE_INTEGER);
  return useCallback(
    () => setTick((tick) => tick - 1 || Number.MAX_SAFE_INTEGER),
    [setTick]
  );
}

// TODO: use ref to keep value and prevent excessive rerenders
export const useObservable = (observable) => {
  const update = useUpdate();

  const state = useMemo(() => {
    const state = {
      lastValue: emptyValue
    };
    const subscription = observable.subscribe((value) => {
      state.lastValue = value;
    });
    subscription.unsubscribe();
    return state;
  }, [observable]);

  useEffect(() => {
    const subscription = observable.subscribe((value) => {
      state.lastValue = value;
      update();
    });

    return () => subscription.unsubscribe();
  }, [observable, state, update]);

  return state.lastValue;
};
