import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";
import { checkAuth } from "./observables/auth";
import "./observables/game-info";

// TODO: https://github.com/cartant/eslint-plugin-rxjs
checkAuth();

ReactDOM.render(<App />, document.getElementById("root"));
