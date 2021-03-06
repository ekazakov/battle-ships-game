import {
  createGame,
  joinGame,
  leaveGame,
  registerUser,
  startGame
} from "../../test-helpers/game-actions";

import { buildAuthCookie } from "../../utils/cookie";
import { buildFastify } from "../../app";
import { DataStorage } from "../../storage";

describe("Game API", () => {
  let fastify = null;
  let storage = null;

  beforeEach(async () => {
    storage = await DataStorage.createMemoryStore();
    fastify = await buildFastify({ storage });
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

    afterEach(async () => {
      await DataStorage.resetMemoryStore(storage);
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
      expect(res.json()).toMatchSnapshot({
        id: "game_1",
        state: "awaiting",
        ownerId: "user_1",
        enemyBoard: null,
        current: null,
        waiting: null,
        winnerId: null
      });
      expect(res.statusCode).toBe(200);
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
            ownerId: "user_1",
            state: "awaiting"
          },
          {
            id: "game_2",
            ownerId: "user_2",
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
        ownerId: "user_1",
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
          ownerId: "user_1",
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
          ownerId: "user_1",
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
        ownerId: "user_1",
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
        ownerId: "user_1",
        state: "destroyed"
      });
    });
    it("should leave not started game", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: `api/game/${game.id}/leave`,
        headers: {
          cookie: buildAuthCookie(bUserId)
        }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        id: "game_1",
        ownerId: "user_1",
        state: "awaiting"
      });
    });

    it("should return error if leaving not existing game", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: "api/game/dummy_game_1/leave",
        headers: {
          cookie: buildAuthCookie(bUserId)
        }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "Game doesn't exist",
        statusCode: 400
      });
    });

    describe("Rejoin after leave", () => {
      beforeEach(async () => {
        await leaveGame(fastify, bUserId, game.id);
      });

      it("should rejoin game after second player left", async () => {
        const res = await joinGame(fastify, bUserId, game.id);
        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({
          id: "game_1",
          ownerId: "user_1",
          state: "awaitingStart"
        });
      });
    });

    describe("Leave started game", () => {
      beforeEach(async () => {
        await startGame(fastify, aUserId, game.id);
      });
      it("should leave started game", async () => {
        const res = await fastify.inject({
          method: "POST",
          url: `api/game/${game.id}/leave`,
          headers: {
            cookie: buildAuthCookie(bUserId)
          }
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({
          id: "game_1",
          ownerId: "user_1",
          state: "destroyed"
        });
      });
    });
  });

  describe("Make turn", () => {
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
      await startGame(fastify, bUserId, game.id);
    });

    it("should make turn by PlayerA", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: `/api/game/${game.id}/turn`,
        headers: {
          cookie: buildAuthCookie(aUserId)
        },
        body: { x: 0, y: 0 }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        id: "game_1",
        ownerId: "user_1",
        state: "playerTurn"
      });
    });

    it("should return error if other player turn", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: `/api/game/${game.id}/turn`,
        headers: {
          cookie: buildAuthCookie(bUserId)
        },
        body: { x: 0, y: 0 }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "Player can't act during other player turn",
        statusCode: 400
      });
    });
  });
});
