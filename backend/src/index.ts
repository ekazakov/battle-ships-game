import { buildFastify } from "./app";

const port = process.env.PORT || 80;

const start = async () => {
  const fastify = await buildFastify({
    logger: {
      prettyPrint: true
    }
  });
  try {
    const address = await fastify.listen(port, "0.0.0.0");
    fastify.log.info(`Server listening on ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
