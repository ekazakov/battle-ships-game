import { useState } from "react";
import { load } from "../../util/load";
import * as auth from "../../observables/auth";
import { useObservable } from "../../hooks/use-observable";
import styled from "@emotion/styled";

const Tabs = styled.div`
  display: flex;
  padding: 10px;
  cursor: pointer;
`;
const Tab = styled.div`
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  &:first-child {
    margin-right: 20px;
  }
`;

export function AuthForm() {
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState("UserA");
  const [password, setPassword] = useState("password");

  const onLoginChange = (evt) => setLogin(() => evt.target.value);
  const onPasswordChange = (evt) => setPassword(() => evt.target.value);
  const lastUpdate = useObservable(auth.authObservable);

  const onSubmit = (evt) => {
    evt.preventDefault();
    if (tab === "login") {
      auth.login({ login, password });
    } else {
      auth.register({ login, password });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Tabs>
        <Tab active={tab === "login"} onClick={() => setTab("login")}>
          SignIn
        </Tab>
        <Tab active={tab === "register"} onClick={() => setTab("register")}>
          SignUp
        </Tab>
      </Tabs>
      <div>
        <label>Login</label>
        <input type="text" value={login} onChange={onLoginChange} />
      </div>
      <div>
        <label>Password</label>
        <input type="text" value={password} onChange={onPasswordChange} />
      </div>
      <div>
        <button type="submit" disabled={lastUpdate.status === "loading"}>
          {tab === "login" ? "Login" : "Register"}
        </button>
      </div>
      {load(auth.authObservable)}
    </form>
  );
}
