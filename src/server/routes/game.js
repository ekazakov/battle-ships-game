const {
  isUserWithNameExists,
  getUserByName,
  registerUser
} = require("../model");
const User = require("../user");

function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function routes(fastify, options) {
  fastify.post("/api/game/create", async (request, reply) => {
    return { a: 1 };
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
        for (let i = 0; i < 10; i++) {
          await sleep(2000);
          yield { id: String(i), data: "Some message" };
        }
      })()
    );
  });
}

module.exports = routes;
