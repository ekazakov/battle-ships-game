const { getUserIdFromCookie } = require("../utils/cookie");
const { getUserById } = require("../services/user");
const { authCheck } = require("../utils/auth-check");

// TODO: add tests
async function routes(fastify) {
  fastify.addHook("onRequest", async function (request, reply) {
    const result = await authCheck(request);
    if (result.code >= 400) {
      reply.code(result.code);
      return reply.send(result.error);
    }
  });

  fastify.get("/api/profile", async (request, reply) => {
    try {
      const userId = getUserIdFromCookie(request.cookies.auth);
      // TODO: handle 404, user maybe deleted asynchronously
      const user = await getUserById(userId);
      return reply.send(user.getInfo());
    } catch (e) {
      reply.code(400);
      return reply.send(e);
    }
  });
}

module.exports = routes;
