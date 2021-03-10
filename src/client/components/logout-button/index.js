import { authObservable, logout } from "../../observables/auth";
import { useObservable } from "../../hooks/use-observable";

export function LogoutButton() {
  const authState = useObservable(authObservable);
  const onClick = () => {
    logout();
  };

  const loading = authState.status === "loading";
  return (
    <div>
      User: <b></b>
      <button type="button" disabled={loading} onClick={onClick}>
        Logout
      </button>
    </div>
  );
}
