import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";
import { checkAuth } from "./observables/auth";

checkAuth();

ReactDOM.render(<App />, document.getElementById("root"));
