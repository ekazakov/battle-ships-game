import { useState } from "react";
import { load } from "../../util/load";
import * as auth from "../../observables/auth";
import { useObservable } from "../../hooks/use-observable";
import styled from "@emotion/styled";
import { useHistory } from "react-router-dom";
import { buttonBase } from "../../styles/button-base";
import { buttonReset } from "../../styles/reset";

const Tabs = styled.div`
  display: flex;
  cursor: pointer;
`;
const Tab = styled.button`
  font-size: 16px;
  ${buttonReset};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  &:first-child {
    margin-right: 10px;
  }

  &:last-child {
    margin-left: 10px;
  }
`;

const LoginButton = styled.button`
  ${buttonBase};
  font-size: 18px;
  padding: 4px 16px;
  border-radius: 2px;
  height: 48px;
  width: 100%;
  background: black;
  color: white;
  margin-top: 20px;
`;

const AuthFormContent = styled.div`
  width: 320px;
  margin: 0 auto;
  margin-top: 128px;

  & > form {
    margin-top: 16px;
  }

  form > div + div {
    margin-top: 16px;
  }
`;

const TextInput = styled.input`
  width: 100%;
  font-size: 20px;
  height: 48px;
  margin-top: 8px;
  padding: 0 8px;
`;

export function AuthForm() {
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState("UserA");
  const [password, setPassword] = useState("password");
  const history = useHistory();

  const onLoginChange = (evt) => setLogin(() => evt.target.value);
  const onPasswordChange = (evt) => setPassword(() => evt.target.value);
  const lastUpdate = useObservable(auth.authObservable);

  const onSubmit = (evt) => {
    evt.preventDefault();
    if (tab === "login") {
      auth.login({ login, password }).then(() => history.push("/"));
    } else {
      auth.register({ login, password }).then(() => history.push("/"));
    }
  };

  return (
    <AuthFormContent onSubmit={onSubmit}>
      <h1>Battle Ships</h1>
      <Tabs>
        <Tab active={tab === "login"} onClick={() => setTab("login")}>
          SignIn
        </Tab>
        {" / "}
        <Tab active={tab === "register"} onClick={() => setTab("register")}>
          SignUp
        </Tab>
      </Tabs>
      <form>
        <div>
          <label>Login</label>
          <div>
            <TextInput type="text" value={login} onChange={onLoginChange} />
          </div>
        </div>
        <div>
          <label>Password</label>
          <div>
            <TextInput
              type="text"
              value={password}
              onChange={onPasswordChange}
            />
          </div>
        </div>
        <div>
          <LoginButton type="submit" disabled={lastUpdate.status === "loading"}>
            {tab === "login" ? "Login" : "Register"}
          </LoginButton>
        </div>
      </form>
      {load(auth.authObservable)}
    </AuthFormContent>
  );
}
