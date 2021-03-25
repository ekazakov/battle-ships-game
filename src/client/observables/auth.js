import { BehaviorSubject } from "rxjs";

export const AuthStatus = {
  UNAUTHORIZED: "UNAUTHORIZED",
  AUTHORIZED: "AUTHORIZED"
};

export function isAuthorized(data) {
  return data.authState === AuthStatus.AUTHORIZED;
}

const subject = new BehaviorSubject({
  status: "idle",
  authState: null,
  user: null
});

const authObservable = subject.asObservable();

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

function login(body) {
  subject.next({
    status: "loading",
    authState: null
  });

  fetch("/api/login", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })
    .then((response) =>
      response.json().then((user) => {
        if (response.ok) {
          subject.next({
            status: "success",
            authState: AuthStatus.AUTHORIZED,
            user
          });
        } else {
          subject.next({
            status: "success",
            authState: AuthStatus.UNAUTHORIZED
          });
        }
      })
    )
    .catch((error) =>
      subject.next({
        authState: AuthStatus.UNAUTHORIZED,
        status: "failure",
        error
      })
    );
}

function register(body) {
  subject.next({
    status: "loading",
    authState: null
  });

  fetch("/api/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })
    .then((response) =>
      response.json().then((user) => {
        if (response.ok) {
          subject.next({
            status: "success",
            authState: AuthStatus.AUTHORIZED,
            user
          });
        } else {
          subject.next({
            status: "success",
            authState: AuthStatus.UNAUTHORIZED,
            user: null
          });
        }
      })
    )
    .catch((error) =>
      subject.next({
        authState: AuthStatus.UNAUTHORIZED,
        status: "failure",
        error
      })
    );
}

function logout() {
  subject.next({
    status: "loading",
    authState: null
  });

  fetch("/api/logout", { method: "POST" })
    .then(() => {
      subject.next({
        authState: AuthStatus.UNAUTHORIZED,
        status: "success"
      });
    })
    .catch((error) =>
      subject.next({
        authState: AuthStatus.AUTHORIZED,
        status: "failure",
        error
      })
    );
}

function checkAuth() {
  subject.next({
    status: "loading",
    authState: null
  });

  fetch("/api/auth_check")
    .then((response) => {
      return response.json().then((user) => {
        if (response.ok) {
          subject.next({
            status: "success",
            authState: AuthStatus.AUTHORIZED,
            user
          });
        } else {
          subject.next({
            status: "success",
            authState: AuthStatus.UNAUTHORIZED
          });
        }
      });
    })
    .catch((error) =>
      subject.next({
        authState: AuthStatus.UNAUTHORIZED,
        status: "failure",
        error
      })
    );
}

function reset() {
  subject.next({
    status: "success",
    authState: AuthStatus.UNAUTHORIZED
  });
}

export { login, register, logout, reset, checkAuth, authObservable };
