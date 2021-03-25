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
import { authObservable, isAuthorized } from "../observables/auth";
import { Global, css } from "@emotion/react";
import { GameList } from "./game-list";
import { Game } from "./game";
import { PrivateRoute } from "./private-route";
import { LogoutButton } from "./logout-button";

const globalStyles = css`
  font-family: "Helvetica Neue", Arial, sans-serif;
`;

export function App() {
  const authState = useObservable(authObservable);

  return (
    <div>
      <Global styles={globalStyles} />

      <BrowserRouter>
        {!isAuthorized(authState) && <AuthForm />}
        {isAuthorized(authState) && <LogoutButton />}

        <ul>
          <li>
            <NavLink to="/game-list">Games</NavLink>
          </li>

          <li>
            <NavLink to="/game">Game</NavLink>
          </li>
        </ul>
        <Switch>
          <Route exact path="/">
            <Redirect to="/game-list" />
          </Route>

          <Route path="/game-list" component={GameList} />
          <PrivateRoute path="/game" exact component={Game} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
