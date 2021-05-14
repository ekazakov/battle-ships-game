const { buildAuthCookie } = require("../../utils/cookie");
const { parseAuthCookie } = require("../../utils/cookie");
const { buildFastify } = require("../../app");
const { Storage } = require("../../storage");

describe("Auth API", () => {
  describe("Registration", () => {
    let fastify = null;
    beforeEach(async () => {
      const storage = await Storage.createMemoryStore();
      fastify = await buildFastify({ storage });
    });

    afterEach(() => {
      fastify.close();
      fastify = null;
    });

    it("should register new user", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/register",
        payload: { login: "UserA", password: "password" }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ gameId: null, id: "user_1", name: "UserA" });

      const parsedCookie = parseAuthCookie(res.headers["set-cookie"]);
      expect(parsedCookie).toEqual({
        name: "auth",
        prefix: "auth-token",
        id: expect.any(String)
      });
    });

    describe("User already exists", () => {
      beforeEach(async () => {
        await fastify.inject({
          method: "POST",
          url: "/api/register",
          payload: { login: "UserA", password: "password" }
        });
      });
      it("should return error if user with login already exists", async () => {
        const res = await fastify.inject({
          method: "POST",
          url: "/api/register",
          payload: { login: "UserA", password: "password" }
        });

        expect(res.statusCode).toBe(400);
        expect(res.json()).toEqual({
          error: "Bad Request",
          message: "User with name 'UserA' already exists",
          statusCode: 400
        });
      });
    });

    it("should return error if user name to short", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: "/api/register",
        payload: { login: "usr", password: "pwd" }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "body.login should NOT be shorter than 5 characters",
        statusCode: 400
      });
    });

    it("should return error if password to short", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: "/api/register",
        payload: { login: "UserA", password: "" }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "body.password should NOT be shorter than 5 characters",
        statusCode: 400
      });
    });

    it("should return error if password to long", async () => {
      const res = await fastify.inject({
        method: "POST",
        url: "/api/register",
        payload: { login: "UserA", password: "a".repeat(51) }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "body.password should NOT be longer than 50 characters",
        statusCode: 400
      });
    });
  });

  describe("Login", () => {
    let fastify = null;

    beforeEach(async () => {
      fastify = await buildFastify();
    });

    afterEach(() => {
      fastify.close();
      fastify = null;
    });

    beforeEach(async () => {
      await fastify.inject({
        method: "POST",
        url: "/api/register",
        payload: { login: "UserA", password: "password" }
      });
    });

    it("should successfully login", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/login",
        payload: { login: "UserA", password: "password" }
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ gameId: null, id: "user_1", name: "UserA" });

      const parsedCookie = parseAuthCookie(res.headers["set-cookie"]);
      expect(parsedCookie).toEqual({
        name: "auth",
        prefix: "auth-token",
        id: expect.any(String)
      });
    });

    it("should return error if user doesn't exists", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/login",
        payload: { login: "UserB", password: "password" }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "Login or password are invalid"
      });
      expect(res.headers["set-cookie"]).toBeUndefined();
    });

    it("should return error if wrong password provided", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/login",
        payload: { login: "UserA", password: "password1" }
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toEqual({
        error: "Bad Request",
        message: "Login or password are invalid"
      });
      expect(res.headers["set-cookie"]).toBeUndefined();
    });
  });

  describe("Logout", () => {
    let fastify = null;

    beforeEach(async () => {
      fastify = await buildFastify();
    });

    afterEach(() => {
      fastify.close();
      fastify = null;
    });

    beforeEach(async () => {
      await fastify.inject({
        method: "POST",
        url: "/api/register",
        payload: { login: "UserA", password: "password" }
      });
    });

    it("should logout authorized user", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/logout",
        headers: {
          cookie: buildAuthCookie(1)
        }
      });

      expect(res.statusCode).toBe(204);
      expect(res.headers["set-cookie"]).toBe(
        "auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
    });

    it("should logout unauthorized user", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/logout"
      });

      expect(res.statusCode).toBe(204);
      expect(res.headers["set-cookie"]).toBe(
        "auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
    });
  });
});
