const { getUserIdFromCookie } = require("../../utils/cookie");
const { getUserById } = require("../user-store");
const { authCheck } = require("../../utils/auth-check");

// TODO: add tests
async function routes(fastify) {
  fastify.addHook("onRequest", async function (request, reply) {
    const result = authCheck(request);
    if (result.code !== 204) {
      reply.code(result.code);
      return reply.send(result.error);
    }
  });

  fastify.get("/api/profile", (request) => {
    const userId = getUserIdFromCookie(request.cookies.auth);
    // TODO: handle 404, user maybe deleted asynchronously
    return getUserById(userId)?.getInfo();
  });
}

module.exports = routes;
