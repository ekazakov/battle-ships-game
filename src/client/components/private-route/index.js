import { Redirect, Route } from "react-router-dom";
import { authObservable, AuthStatus } from "../../observables/auth";
import { load } from "../../util/load";

export function PrivateRoute({ render, ...otherProps }) {
  return (
    <Route
      {...otherProps}
      render={(props) => {
        return load(authObservable, {
          render(authState) {
            if (authState === AuthStatus.AUTHORIZED) {
              return render(props);
            }

            return <Redirect to="/login" />;
          }
        });
      }}
    />
  );
}
