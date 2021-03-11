const { authCheck } = require("../utils/auth-check");
const { nextGameState } = require("../services/game");
const { getGameById } = require("../services/game");
const { getGamesList } = require("../services/game");
const { getUserById } = require("../services/user");
const { getUserIdFromCookie } = require("../utils/cookie");
const { createNewGame } = require("../services/game");

const anAuthorizedAccessList = ["/api/game/list"];

async function routes(fastify) {
  fastify.addHook("onRequest", async function (request, reply) {
    if (anAuthorizedAccessList.includes(request.url)) {
      return;
    }

    const result = await authCheck(request);
    if (result.code !== 204) {
      reply.code(result.code);
      return reply.send(result.error);
    }
  });

  // TODO: refactor routes to RESTful style
  fastify.get("/api/game/list", async () => {
    return await getGamesList();
  });

  fastify.get("/api/game/:id", async (request, reply) => {
    try {
      const game = await getGameById(request.params.id);

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
    // TODO: handle exception and return 400
    const game = await createNewGame(userId);
    return game.getGameState();
  });

  fastify.post("/api/game/:id/join", async (request, reply) => {
    try {
      const userId = getUserIdFromCookie(request.cookies.auth);
      const user = await getUserById(userId);
      const { id } = request.params;
      const game = await getGameById(id);

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
      const game = await getGameById(request.params.id);

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
      const user = await getUserById(userId);
      const { id } = request.params;
      const game = await getGameById(id);

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
      const user = await getUserById(userId);
      const {
        params: { id },
        body: target
      } = request;

      const game = await getGameById(id);

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

  fastify.get("/api/game/:id/subscribe", async (request, reply) => {
    try {
      const {
        params: { id }
      } = request;

      const game = await getGameById(id);

      if (!game) {
        reply.code(400);
        return reply.send(new Error("Game doesn't exist"));
      }

      reply.sse(
        (async function* source() {
          const evt1 = { data: JSON.stringify(game.getGameState()) };
          yield evt1;

          while (!game.isOver()) {
            const gameState = await nextGameState(game);
            const evt = { data: JSON.stringify(gameState) };
            // console.log("evt:", evt);
            yield evt;
          }
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
