const { FastifySSEPlugin } = require("fastify-sse-v2");
const FastifyCookiePlugin = require("fastify-cookie");
const fastifyFactory = require("fastify");
const customAjvKeywords = require("./custom-ajv-keywords");

const fastify = fastifyFactory(({
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
}));

fastify.register(FastifySSEPlugin);
fastify.register(FastifyCookiePlugin);
fastify.register(require("./routes/auth"));
fastify.register(require("./routes/game"));

const port = process.env.PORT || 8000;

const start = async () => {
  try {
    const address = await fastify.listen(port);
    fastify.log.info(`Server listening on ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
