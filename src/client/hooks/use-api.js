// TODO: use https://react-query.tanstack.com/
import { useEffect } from "react";
import { BehaviorSubject } from "rxjs";

const observablesCache = {};

export function useApiObservable(url, options) {
  if (!observablesCache[url]) {
    observablesCache[url] = new BehaviorSubject({
      status: "idle",
      value: null,
      error: null
    });
  }

  useEffect(() => {
    (async () => {
      const subject = observablesCache[url];

      subject.next({ ...subject.getValue(), status: "loading" });
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        subject.next({ status: "success", value: data, error: null });
      } else {
        subject.next({ status: "failure", value: null, error: data });
      }
    })();
  }, [url, options]);

  return observablesCache[url];
}
