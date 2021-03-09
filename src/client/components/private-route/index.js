import { Redirect, Route } from "react-router-dom";
import { authObservable, AuthStatus } from "../../observables/auth";
import { useObservable } from "../../hooks/use-observable";

export function PrivateRoute({ render, ...otherProps }) {
  const authState = useObservable(authObservable);
  return (
    <Route
      {...otherProps}
      render={(props) => {
        if (authState.value === AuthStatus.AUTHORIZED) {
          return render(props);
        }

        return <Redirect to="/" />;
      }}
    />
  );
}
