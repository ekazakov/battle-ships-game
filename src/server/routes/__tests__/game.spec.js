const EventSource = require("eventsource");
const { buildAuthCookie } = require("../../../utils/cookie");
const { parseAuthCookie } = require("../../../utils/cookie");
const { buildFastify } = require("../../app");

const createUrl = (port, id) =>
  // `http://localhost:${port}/api/game/create`;
  `http://localhost:${port}/api/game/${id}/subscribe`;

async function registerUser(fastify, { login, password }) {
  const res = await fastify.inject({
    method: "POST",
    url: "/api/register",
    payload: { login, password }
  });
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

      console.log(res.json());
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
    beforeEach(async () => {
      aUserId = await registerUser(fastify, {
        login: "UserA",
        password: "password"
      });
      bUserId = await registerUser(fastify, {
        login: "UserB",
        password: "password"
      });
      await Promise.all([createGame(fastify, aUserId)]);
    });

    it("should return error if game doesn't exists", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/game/game_1/join",
        headers: {
          cookie: buildAuthCookie("user_1")
        }
      });

      expect(res.statusCode).toBe(500);
      expect(res.json()).toEqual({});
    });

    it.skip("should join the game", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "GET",
        url: "/api/game/",
        headers: {
          cookie: buildAuthCookie("user_1")
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });

    it.skip("should return error if two users in the game", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "GET",
        url: "/api/game/",
        headers: {
          cookie: buildAuthCookie("user_1")
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });
    it.skip("should return ok if joining own game", async () => {});
    it.skip("should return ok if joining game again", async () => {});
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
