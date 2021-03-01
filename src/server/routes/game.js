const { getGameById } = require("../game-store");
const { getGamesList } = require("../game-store");
const { getUserById } = require("../user-store");
const { getUserIdFromCookie } = require("../../utils/cookie");
const { createNewGame } = require("../game-store");

const anAuthorizedAccessList = ["/api/game/list"];

async function routes(fastify) {
  fastify.addHook("onRequest", async function (request, reply) {
    if (anAuthorizedAccessList.includes(request.url)) {
      return;
    }

    if (!request.cookies.auth) {
      reply.code(400);
      return reply.send(new Error("User not authorized"));
    }

    const userId = getUserIdFromCookie(request.cookies.auth);

    if (!getUserById(userId)) {
      reply.code(400);
      return reply.send(new Error("User doesn't exist"));
    }
  });

  fastify.get("/api/game/list", () => {
    return getGamesList();
  });

  fastify.get("/api/game/:id", (request, reply) => {
    try {
      const game = getGameById(request.params.id);

      if (!game) {
        reply.code(404);
        return reply.send(new Error("Game doesn't exits"));
      }
      return game.getInfo();
    } catch (e) {
      reply.code(400);
      return reply.send(e);
    }
  });

  fastify.post("/api/game/create", async (request) => {
    const userId = getUserIdFromCookie(request.cookies.auth);
    const game = createNewGame(userId);
    return { id: game.getId() };
  });

  fastify.post("/api/game/:id/join", async (request, reply) => {
    try {
      const userId = getUserIdFromCookie(request.cookies.auth);
      const user = getUserById(userId);
      const { id } = request.params;
      const game = getGameById(id);

      if (!game) {
        reply.code(400);
        return reply.send(new Error("Game doesn't exist"));
      }

      game.join(user);

      reply.code(200);
      return game.getInfo();
    } catch (e) {
      reply.code(400);
      return reply.send(e);
    }
  });

  fastify.post("/api/game/:id/start", async (request, reply) => {
    try {
      const game = getGameById(request.params.id);

      if (!game) {
        reply.code(400);
        return reply.send(new Error("Game doesn't exist"));
      }

      game.start();

      reply.code(200);
      return game.getInfo();
    } catch (e) {
      reply.code(400);
      return reply.send(e);
    }
  });

  fastify.post("/api/game/:id/leave", async (request, reply) => {
    try {
      const userId = getUserIdFromCookie(request.cookies.auth);
      const user = getUserById(userId);
      const { id } = request.params;
      const game = getGameById(id);

      if (!game) {
        reply.code(400);
        return reply.send(new Error("Game doesn't exist"));
      }

      game.leave(user);
      reply.code(200);
      return game.getInfo();
    } catch (e) {
      console.error(e);
      reply.code(400);
      return reply.send(e);
    }
  });

  fastify.post("/api/game/:id/turn", async (request, reply) => {
    try {
      const userId = getUserIdFromCookie(request.cookies.auth);
      const user = getUserById(userId);
      const {
        params: { id },
        body: target
      } = request;

      const game = getGameById(id);

      if (!game) {
        reply.code(400);
        return reply.send(new Error("Game doesn't exist"));
      }

      game.makeShot(user, target);
      reply.code(200);
      return game.getInfo();
    } catch (e) {
      console.error(e);
      reply.code(400);
      return reply.send(e);
    }
  });

  fastify.get("/api/game/:id/subscribe", (request, reply) => {
    try {
      const {
        params: { id }
      } = request;

      const game = getGameById(id);

      if (!game) {
        reply.code(400);
        return reply.send(new Error("Game doesn't exist"));
      }

      reply.sse(
        (async function* source() {
          yield { data: JSON.stringify(game.getGameState()) };
          const gameState = await new Promise((resolve, reject) => {
            try {
              const foo = (event, payload) => {
                resolve(payload);
              };
              game.addObserver(foo);
              game.removeObserver(foo);
            } catch (error) {
              reject(error);
            }
          });
          yield { data: gameState };
          yield { data: "Done" };
        })()
      );
    } catch (e) {
      console.error(e);
      reply.code(400);
      return reply.send(e);
    }
  });
}

module.exports = routes;
