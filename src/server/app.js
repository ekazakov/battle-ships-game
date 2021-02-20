const { FastifySSEPlugin } = require("fastify-sse-v2");
const FastifyCookiePlugin = require("fastify-cookie");
const fastifyFactory = require("fastify");
const customAjvKeywords = require("./custom-ajv-keywords");

exports.initializeApp = function initializeApp() {
  const fastify = fastifyFactory({
    logger: {
      prettyPrint: true
    },
    ajv: {
      customOptions: {
        removeAdditional: true,
        useDefaults: true,
        coerceTypes: true,
        allErrors: false,
        nullable: true
      },
      plugins: [customAjvKeywords]
    }
  });

  fastify.register(FastifySSEPlugin);
  fastify.register(FastifyCookiePlugin);
  fastify.register(require("./routes/auth"));
  fastify.register(require("./routes/game"));

  return fastify;
};
