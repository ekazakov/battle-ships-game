// const EventSource = require("eventsource");
const { buildAuthCookie } = require("../../../utils/cookie");
const { parseAuthCookie } = require("../../../utils/cookie");
const { buildFastify } = require("../../app");

// const createUrl = (port, id) =>
//   `http://localhost:${port}/api/game/${id}/subscribe`;

async function registerUser(fastify, { login, password }) {
  const res = await fastify.inject({
    method: "POST",
    url: "/api/register",
    payload: { login, password }
  });

  if (res.statusCode !== 204 && res.statusCode !== 200) {
    throw new Error(res.json().message);
  }
  return parseAuthCookie(res.headers["set-cookie"]).id;
}

async function createGame(fastify, userId) {
  const res = await fastify.inject({
    method: "POST",
    url: "/api/game/create",
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });

  return res.json();
}

async function joinGame(fastify, userId, gameId) {
  const res = await fastify.inject({
    method: "POST",
    url: `/api/game/${gameId}/join`,
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });

  if (res.statusCode !== 204 && res.statusCode !== 200) {
    throw new Error(res.json().message);
  }

  return res;
}

async function startGame(fastify, userId, gameId) {
  const res = await fastify.inject({
    method: "POST",
    url: `/api/game/${gameId}/start`,
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });

  if (res.statusCode !== 204 && res.statusCode !== 200) {
    throw new Error(res.json().message);
  }

  return res;
}

async function getGame(fastify, userId, gameId) {
  return await fastify.inject({
    method: "GET",
    url: `/api/game/${gameId}`,
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });
}

describe("Game API", () => {
  let fastify = null;

  beforeEach(() => {
    fastify = buildFastify();
  });

  afterEach(() => {
    fastify.close();
    fastify = null;
  });

  describe("Create game", () => {
    let aUserId = null;

    beforeEach(async () => {
      aUserId = await registerUser(fastify, {
        login: "UserA",
        password: "password"
      });
    });

    it("should create new game", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/game/create",
        headers: {
          cookie: buildAuthCookie(aUserId)
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        id: "game_1"
      });
    });

    it("should return error if user is not authorized", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/game/create"
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        statusCode: 400,
        error: "Bad Request",
        message: "User not authorized"
      });
    });

    it("should return error if user doesn't exist", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/game/create",
        headers: {
          cookie: buildAuthCookie(2)
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        statusCode: 400,
        error: "Bad Request",
        message: "User doesn't exist"
      });
    });
  });

  describe("List games", () => {
    it("should return empty list if now games exists", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "GET",
        url: "/api/game/list"
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    describe("List existing games", () => {
      beforeEach(async () => {
        const aUserId = await registerUser(fastify, {
          login: "UserA",
          password: "password"
        });
        const bUserId = await registerUser(fastify, {
          login: "UserB",
          password: "password"
        });
        await Promise.all([
          createGame(fastify, aUserId),
          createGame(fastify, bUserId)
        ]);
      });

      it("should return games list", async () => {
        expect.hasAssertions();
        const res = await fastify.inject({
          method: "GET",
          url: "/api/game/list"
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual([
          {
            id: "game_1",
            owner: {
              id: "user_1",
              name: "UserA"
            },
            state: "awaiting"
          },
          {
            id: "game_2",
            owner: {
              id: "user_2",
              name: "UserB"
            },
            state: "awaiting"
          }
        ]);
      });
    });
  });

  describe("Join game", () => {
    let aUserId = null;
    let bUserId = null;
    let cUserId = null;
    let game = null;

    beforeEach(async () => {
      aUserId = await registerUser(fastify, {
        login: "UserA",
        password: "password"
      });
      bUserId = await registerUser(fastify, {
        login: "UserB",
        password: "password"
      });
      cUserId = await registerUser(fastify, {
        login: "UserC",
        password: "password"
      });

      game = await createGame(fastify, aUserId);
    });

    it("should return error if game doesn't exists", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/game/game_2/join",
        headers: {
          cookie: buildAuthCookie("user_1")
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "Game doesn't exist",
        statusCode: 400
      });
    });

    it("should join the game", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: `api/game/${game.id}/join`,
        headers: {
          cookie: buildAuthCookie(bUserId)
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        id: "game_1",
        owner: {
          id: "user_1",
          name: "UserA"
        },
        state: "awaitingStart"
      });
    });

    describe("Joining full game", () => {
      beforeEach(async () => {
        await joinGame(fastify, bUserId, game.id);
      });

      it("should return error if two users in the game", async () => {
        expect.hasAssertions();
        const res = await fastify.inject({
          method: "POST",
          url: `/api/game/${game.id}/join`,
          headers: {
            cookie: buildAuthCookie(cUserId)
          }
        });

        expect(res.statusCode).toBe(400);
        expect(res.json()).toEqual({
          error: "Bad Request",
          // eslint-disable-next-line quotes
          message: `action: "join" is not supported in state: "awaitingStart"`,
          statusCode: 400
        });
      });

      it("should return ok if joining own game", async () => {
        expect.hasAssertions();
        const res = await fastify.inject({
          method: "POST",
          url: `/api/game/${game.id}/join`,
          headers: {
            cookie: buildAuthCookie(aUserId)
          }
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({
          id: "game_1",
          owner: {
            id: "user_1",
            name: "UserA"
          },
          state: "awaitingStart"
        });
      });

      it("should return ok if joining game again", async () => {
        expect.hasAssertions();
        const res = await fastify.inject({
          method: "POST",
          url: `/api/game/${game.id}/join`,
          headers: {
            cookie: buildAuthCookie(bUserId)
          }
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({
          id: "game_1",
          owner: {
            id: "user_1",
            name: "UserA"
          },
          state: "awaitingStart"
        });
      });
    });
  });

  describe("Start game", () => {
    let aUserId = null;
    let bUserId = null;
    let game = null;

    beforeEach(async () => {
      aUserId = await registerUser(fastify, {
        login: "UserA",
        password: "password"
      });
      bUserId = await registerUser(fastify, {
        login: "UserB",
        password: "password"
      });

      game = await createGame(fastify, aUserId);
      await joinGame(fastify, bUserId, game.id);
    });

    it("should return error if game doesn't exists", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/game/game_2/start",
        headers: {
          cookie: buildAuthCookie("user_1")
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "Game doesn't exist",
        statusCode: 400
      });
    });

    it("should start the game", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: `api/game/${game.id}/start`,
        headers: {
          cookie: buildAuthCookie(aUserId)
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        id: "game_1",
        owner: {
          id: "user_1",
          name: "UserA"
        },
        state: "playerTurn"
      });
    });

    it("should return error on already started game", async () => {
      expect.hasAssertions();
      await startGame(fastify, aUserId, game.id);

      const res = await fastify.inject({
        method: "POST",
        url: `api/game/${game.id}/start`,
        headers: {
          cookie: buildAuthCookie(aUserId)
        }
      });
      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        // eslint-disable-next-line quotes
        message: `action: "start" is not supported in state: "playerTurn"`,
        statusCode: 400
      });
    });
  });

  describe("Leave game", () => {
    let aUserId = null;
    let bUserId = null;
    let game = null;

    beforeEach(async () => {
      aUserId = await registerUser(fastify, {
        login: "UserA",
        password: "password"
      });
      bUserId = await registerUser(fastify, {
        login: "UserB",
        password: "password"
      });

      game = await createGame(fastify, aUserId);
      await joinGame(fastify, bUserId, game.id);
    });

    it("should destroy game if owner left", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: `api/game/${game.id}/leave`,
        headers: {
          cookie: buildAuthCookie(aUserId)
        }
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        id: "game_1",
        owner: null,
        state: "destroyed"
      });
    });
    it("should leave not started game", async () => {});

    it("should return error if leaving not existing game", async () => {});
    it("should rejoin game after second player left", async () => {});

    describe("Leave started game", () => {
      it("should leave started game", async () => {});
    });
  });

  // it("One", (done) => {
  //   fastify.listen(0, () => {
  //     const port = fastify.server.address().port;
  //     const es = new EventSource(createUrl(port, 1));
  //     es.onmessage = (evt) => {
  //       console.log(evt);
  //     };
  //     es.onopen = (evt) => {
  //       console.log("onopen", evt);
  //     };
  //     es.addEventListener("end", (evt) => {
  //       console.log("onend", evt);
  //       done();
  //     });
  //     es.onerror = (evt) => {
  //       console.log("onerror", evt.message);
  //       if (evt.message != null) {
  //         done(evt);
  //       }
  //     };
  //   });
  // });
});
