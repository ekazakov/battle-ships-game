import React from "react";
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";
import { Global, css } from "@emotion/react";
import { Game } from "./game";
import { PrivateRoute } from "./private-route";
import { LoginPage } from "../pages/login-page";
import { GameListPage } from "../pages/games-list-page";

const globalStyles = css`
  html,
  body {
    font-family: "Helvetica Neue", Arial, sans-serif;
    margin: 0;
  }

  a {
    color: black;
  }
`;

export function App() {
  return (
    <div>
      <Global styles={globalStyles} />

      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Redirect to="/game-list" />
          </Route>

          <Route path="/login" component={LoginPage} />
          <Route path="/game-list" component={GameListPage} />
          <PrivateRoute
            path="/game"
            exact
            render={(props) => <Game {...props} />}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
