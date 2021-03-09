export const AuthStatus = {
  UNAUTHORIZED: "UNAUTHORIZED",
  AUTHORIZED: "AUTHORIZED"
};

import { BehaviorSubject } from "rxjs";

const subject = new BehaviorSubject({
  status: "idle",
  value: null
});

const authObservable = subject.asObservable();

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

function login(body) {
  subject.next({
    status: "loading",
    value: null
  });

  fetch("/api/login", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })
    .then((response) =>
      response.json().then(() => {
        if (response.ok) {
          subject.next({
            status: "success",
            value: AuthStatus.AUTHORIZED
          });
        } else {
          subject.next({
            status: "success",
            value: AuthStatus.UNAUTHORIZED
          });
        }
      })
    )
    .catch((error) =>
      subject.next({
        value: AuthStatus.UNAUTHORIZED,
        status: "failure",
        error
      })
    );
}

function register(body) {
  subject.next({
    status: "loading",
    value: null
  });
  fetch("/api/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })
    .then((response) =>
      response.json().then(() => {
        if (response.ok) {
          subject.next({
            status: "success",
            value: AuthStatus.AUTHORIZED
          });
        } else {
          subject.next({
            status: "success",
            value: AuthStatus.UNAUTHORIZED
          });
        }
      })
    )
    .catch((error) =>
      subject.next({
        value: AuthStatus.UNAUTHORIZED,
        status: "failure",
        error
      })
    );
}

function logout() {
  subject.next({
    status: "loading",
    value: null
  });
  fetch("/api/logout", { method: "POST" })
    .then(() => {
      subject.next({
        value: AuthStatus.UNAUTHORIZED,
        status: "success"
      });
    })
    .catch((error) =>
      subject.next({
        value: AuthStatus.AUTHORIZED,
        status: "failure",
        error
      })
    );
}

function checkAuth() {
  subject.next({
    status: "loading",
    value: null
  });
  fetch("/api/auth_check")
    .then((response) => {
      if (response.ok) {
        subject.next({
          value: AuthStatus.AUTHORIZED,
          status: "success"
        });
      } else {
        subject.next({
          value: AuthStatus.UNAUTHORIZED,
          status: "success"
        });
      }
    })
    .catch((error) =>
      subject.next({
        value: AuthStatus.UNAUTHORIZED,
        status: "failure",
        error
      })
    );
}

function reset() {
  subject.next({
    status: "success",
    value: AuthStatus.UNAUTHORIZED
  });
}

export { login, register, logout, reset, checkAuth, authObservable };
