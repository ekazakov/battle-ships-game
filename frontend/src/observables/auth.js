import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { baseUrl } from "../util/constants";

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
  user: null,
  error: null
});

const authStoreObservable = subject.asObservable();

const headers = {
  "Content-Type": "application/json; charset=utf-8"
};

function login(body) {
  subject.next({
    ...subject.getValue(),
    status: "loading",
    error: null
  });

  return fetch(baseUrl + "/api/login", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include"
  })
    .then((response) =>
      response.json().then((user) => {
        if (response.ok) {
          subject.next({
            status: "success",
            authState: AuthStatus.AUTHORIZED,
            user,
            error: null
          });
        } else {
          subject.next({
            status: "success",
            authState: AuthStatus.UNAUTHORIZED,
            error: null
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
    ...subject.getValue(),
    status: "loading",
    error: null
  });

  return fetch(baseUrl + "/api/register", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include"
  })
    .then((response) =>
      response.json().then((user) => {
        if (response.ok) {
          subject.next({
            status: "success",
            authState: AuthStatus.AUTHORIZED,
            user,
            error: null
          });
        } else {
          subject.next({
            status: "success",
            authState: AuthStatus.UNAUTHORIZED,
            user: null,
            error: null
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
    ...subject.getValue(),
    status: "loading",
    error: null
  });

  fetch(baseUrl + "/api/logout", { method: "POST", credentials: "include" })
    .then(() => {
      subject.next({
        authState: AuthStatus.UNAUTHORIZED,
        status: "success",
        error: null,
        user: null
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
    ...subject.getValue(),
    status: "loading"
  });

  fetch(baseUrl + "/api/auth_check", { credentials: "include" })
    .then((response) => {
      return response.json().then((user) => {
        if (response.ok) {
          subject.next({
            status: "success",
            authState: AuthStatus.AUTHORIZED,
            user,
            error: null
          });
        } else {
          subject.next({
            status: "success",
            authState: AuthStatus.UNAUTHORIZED,
            error: null
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

export function profile() {
  subject.next({
    ...subject.getValue(),
    status: "loading"
  });

  fetch(baseUrl + "/api/profile", { credentials: "include" })
    .then((response) => {
      return response.json().then((user) => {
        if (response.ok) {
          subject.next({
            status: "success",
            authState: AuthStatus.AUTHORIZED,
            user,
            error: null
          });
        } else {
          subject.next({
            ...subject.getValue(),
            status: "success",
            authState: AuthStatus.UNAUTHORIZED,
            error: null
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

const profileObservable = authStoreObservable.pipe(
  map((state) => {
    return { status: state.status, error: state.error, value: state.user };
  })
);
const authObservable = authStoreObservable.pipe(
  map((state) => {
    const status = state.status === "error" ? "success" : state.status;
    return { status, error: null, value: state.authState };
  })
);

export {
  login,
  register,
  logout,
  reset,
  checkAuth,
  authStoreObservable,
  profileObservable,
  authObservable
};
