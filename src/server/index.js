const { buildFastify } = require("./app");

const port = process.env.PORT || 8000;

const start = async () => {
  const fastify = buildFastify({
    logger: {
      prettyPrint: true
    }
  });

  try {
    const address = await fastify.listen(port);
    fastify.log.info(`Server listening on ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
