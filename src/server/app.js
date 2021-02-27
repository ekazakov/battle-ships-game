const { FastifySSEPlugin } = require("fastify-sse-v2");
const FastifyCookiePlugin = require("fastify-cookie");
const fastifyFactory = require("fastify");
const customAjvKeywords = require("./custom-ajv-keywords");
const { resetIds } = require("../common/id-generator");
const { resetGamesStore } = require("./game-store");
const { resetUsers } = require("./user-store");

const defaultOptions = {
  logger: false,
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
};

exports.buildFastify = function buildFastify(options = {}) {
  resetIds();
  resetUsers();
  resetGamesStore();
  const fastify = fastifyFactory(Object.assign({}, defaultOptions, options));

  fastify.register(FastifySSEPlugin);
  fastify.register(FastifyCookiePlugin);
  fastify.register(require("./routes/auth"));
  fastify.register(require("./routes/game"));

  return fastify;
};
