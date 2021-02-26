const { getUserById } = require("../user-store");
const { getUserIdFromCookie } = require("../../utils/cookie");
const { createNewGame } = require("../game-store");

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function routes(fastify) {
  fastify.addHook("onRequest", async function (request, reply) {
    if (!request.cookies.auth) {
      reply.code(400);
      return reply.send(new Error("User not authorized"));
    }

    const userId = getUserIdFromCookie(request.cookies.auth);

    if (!getUserById(userId)) {
      reply.code(400);
      return reply.send(new Error("User doesn't exists"));
    }
  });

  fastify.post("/api/game/create", async (request) => {
    const userId = getUserIdFromCookie(request.cookies.auth);
    const game = createNewGame(userId);
    return { id: game.getId() };
  });

  fastify.post("/api/game/:id/join", async (request, reply) => {
    return { a: 2 };
  });

  fastify.post("/api/game/:id/leave", async (request, reply) => {
    return { a: 3 };
  });

  fastify.get("/api/game/:id/subscribe", (request, reply) => {
    reply.sse(
      (async function* source() {
        for (let i = 0; i < 3; i++) {
          await sleep(10);
          yield { data: `Some message: ${i}` };
        }
      })()
    );
  });
}

module.exports = routes;
