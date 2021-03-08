// TODO: use https://react-query.tanstack.com/
import { useState } from "react";

export function useApi(url, options) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  async function request(body) {
    let response = null;
    setStatus(() => "loading");
    setError(() => null);

    try {
      response = await fetch(url, {
        method: options.method || "GET",
        body: JSON.stringify(body),
        headers: Object.assign(
          {},
          {
            "Content-Type": "application/json; charset=utf-8"
          },
          options.headers
        )
      });
    } catch (err) {
      console.log(">>> ", error);
      err.networkError = true;
      setStatus(() => "failed");
      setError(() => err);
      setData(() => null);
      console.error(error);
      return;
    }

    const payload = await response.json();

    if (response.status >= 400) {
      setStatus(() => "failed");
      setError(() => payload);
      setData(() => null);
      console.error(payload);
      return;
    }

    setStatus(() => "success");
    setError(() => null);
    setData(() => payload);
  }

  return {
    request: (...args) => {
      // noinspection JSIgnoredPromiseFromCall
      request(...args);
    },
    status,
    error,
    data
  };
}
