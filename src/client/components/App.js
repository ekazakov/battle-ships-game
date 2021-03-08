import React from "react";
import { AuthForm } from "./login-form";

export function App() {
  return (
    <div>
      <AuthForm />
    </div>
  );
}

window.register = async function (login, password = "pwd1") {
  const data = { login, password };
  const response = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  });
  const result = await response.json();

  console.log("result", result);
};
