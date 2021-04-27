import { useHistory } from "react-router";
import { useCallback } from "react";

export function useRedirect() {
  const history = useHistory();
  return useCallback((url) => history.push(url), [history]);
}
