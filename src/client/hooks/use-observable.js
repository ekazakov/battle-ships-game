import { useState, useEffect, useMemo } from "react";

const emptyValueTag = Symbol("useObservableEmptyValueTag");
export const emptyValue = { [emptyValueTag]: true };

export function isEmptyValue(value) {
  return value === emptyValue;
}

export const useObservable = (observable) => {
  const [update, setUpdate] = useState({ lastValue: emptyValue });
  useMemo(() => {
    const subscription = observable.subscribe((lastValue) => {
      setUpdate(() => ({ lastValue }));
    });
    subscription.unsubscribe();
  }, [observable]);

  useEffect(() => {
    const subscription = observable.subscribe((lastValue) => {
      setUpdate(() => ({ lastValue }));
    });

    return () => subscription.unsubscribe();
  }, [observable]);

  return update.lastValue;
};
