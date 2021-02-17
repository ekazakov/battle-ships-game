import React from "react";

function App() {
  return <div>Hello App</div>;
}

module.exports = App;

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
