const { authCheck } = require("../utils/auth-check");
const { getUserIdFromCookie } = require("../utils/cookie");
const { getUserById } = require("../services/user");
const {
  nextGameState,
  getGameById,
  getGamesList,
  createNewGame,
  startGame,
  joinGame,
  makeGameTurn,
  leaveGame
} = require("../services/game");

// TODO: use https://github.com/snd/url-pattern for testing urls
const anAuthorizedAccessList = ["/api/game/list"];

async function routes(fastify) {
  fastify.addHook("onRequest", async function (request, reply) {
    if (anAuthorizedAccessList.includes(request.url)) {
      return;
    }

    const result = await authCheck(request);
    if (result.code >= 400) {
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

  fastify.post("/api/game/create", async (request, reply) => {
    // TODO: handle exception and return 400
    try {
      const userId = getUserIdFromCookie(request.cookies.auth);
      const game = await createNewGame(userId);
      return game.getGameStateForPlayer(userId);
    } catch (error) {
      console.log(error);
      reply.code(400);
      return reply.send(error);
    }
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

      await joinGame(game, user);

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

      await startGame(game);

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

      await leaveGame(game, user);

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

      await makeGameTurn(game, user, target);
      reply.code(200);
      return game.getInfo();
    } catch (e) {
      console.error(e);
      reply.code(400);
      return reply.send(e);
    }
  });

  fastify.get("/api/game/:id/other_player", async (request, reply) => {
    try {
      const userId = getUserIdFromCookie(request.cookies.auth);
      const game = await getGameById(request.params.id);
      if (!game) {
        reply.code(404);
        return reply.send(new Error("Game doesn't exits"));
      }

      const ownerId = game.getOwnerId();
      const secondPlayerId = game.getSecondPlayerId();
      const otherPlayerId = userId === ownerId ? secondPlayerId : ownerId;

      if (otherPlayerId) {
        const user = await getUserById(otherPlayerId);

        if (user) {
          return reply.send(user.getInfo());
        }
      }
      reply.code(204);
      return reply.send();
    } catch (e) {
      reply.code(400);
      return reply.send(e);
    }
  });

  fastify.get("/api/game/:id/subscribe", (request, reply) => {
    const {
      params: { id }
    } = request;
    const userId = getUserIdFromCookie(request.cookies.auth);

    getGameById(id)
      .then((game) => {
        if (!game) {
          reply.code(400);
          return reply.send(new Error("Game doesn't exist"));
        }

        reply.raw.setHeader(
          "Access-Control-Allow-Origin",
          request.headers.origin
        );
        reply.raw.setHeader("access-control-allow-credentials", true);
        reply.raw.setHeader("access-control-allow-methods", "GET");

        // TODO: Update fastify-sse-v2 plugin to v2.0.4
        reply.sse(
          (async function* source() {
            const evt1 = {
              data: JSON.stringify(game.getGameStateForPlayer(userId))
            };
            yield evt1;

            while (!game.isOver()) {
              // TODO: fix memory leak
              const gameState = await nextGameState(game.getId(), userId);
              // console.log(
              //   `>> [${userId}] game transitioned to: ${gameState.state}`
              // );
              const evt = { data: JSON.stringify(gameState) };
              yield evt;
            }
          })()
        );
      })
      .catch((e) => {
        console.error(e);
        reply.code(400);
        return reply.send(e);
      });
  });
}

module.exports = routes;
