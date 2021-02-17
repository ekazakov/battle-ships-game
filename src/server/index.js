const { FastifySSEPlugin } = require("fastify-sse-v2");
const fastify = require("fastify")({
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
    plugins: [require("./custom-ajv-keywords")]
  }
});

fastify.register(FastifySSEPlugin);
fastify.register(require("fastify-cookie"));
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
