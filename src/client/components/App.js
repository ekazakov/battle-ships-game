import React from "react";
import { AuthForm } from "./login-form";
import {
  Switch,
  Route,
  BrowserRouter,
  Redirect,
  NavLink
} from "react-router-dom";
import { useObservable } from "../hooks/use-observable";
import { authObservable, AuthStatus } from "../observables/auth";
import { Global, css } from "@emotion/react";
import { GameList } from "./game-list";
import { Game } from "./game";
import { PrivateRoute } from "./private-route";
import { LogoutButton } from "./logout-button";
// import { load } from "../util/load";

const globalStyles = css`
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

export function App() {
  const authState = useObservable(authObservable);

  return (
    <div>
      <Global styles={globalStyles} />

      <BrowserRouter>
        {authState.value === AuthStatus.UNAUTHORIZED && <AuthForm />}
        {authState.value === AuthStatus.AUTHORIZED && <LogoutButton />}

        <ul>
          <li>
            <NavLink to="/profile">Profile</NavLink>
          </li>
          <li>
            <NavLink to="/game-list">Games</NavLink>
          </li>

          <li>
            <NavLink to="/game/1">Game 1</NavLink>
          </li>
        </ul>
        <Switch>
          <Route exact path="/">
            <Redirect to="/game-list" />
          </Route>

          <Route path="/game-list" component={GameList} />
          <Route path="/game-list/foo" component={GameList} />
          <PrivateRoute
            path="/game/:id"
            render={(props) => <Game {...props} />}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
