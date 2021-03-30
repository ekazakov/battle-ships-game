import { AuthForm } from "../../components/login-form";
import { load } from "../../util/load";
import { authObservable, AuthStatus } from "../../observables/auth";
import { Redirect } from "react-router-dom";

export function LoginPage() {
  return load(authObservable, {
    render(authState) {
      if (authState !== AuthStatus.AUTHORIZED) {
        return <AuthForm />;
      }

      return <Redirect to="/" />;
    }
  });
}
