const { FastifySSEPlugin } = require("fastify-sse-v2");
const FastifyCookiePlugin = require("fastify-cookie");
const fastifyFactory = require("fastify");
// TODO: fix custom keywords
// const customAjvKeywords = require("./utils/custom-ajv-keywords");
const { Context } = require("./context");
const { Storage } = require("./storage");
const { resetIds } = require("./utils/id-generator");

const defaultOptions = {
  logger: false,
  ajv: {
    customOptions: {
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: true,
      allErrors: false,
      nullable: true
    }
    // plugins: [customAjvKeywords]
  }
};

exports.buildFastify = async function buildFastify(options = {}) {
  resetIds();
  Context.storage = options.storage || (await Storage.createFileStore());
  const fastify = fastifyFactory(Object.assign({}, defaultOptions, options));

  fastify.register(FastifySSEPlugin);
  fastify.register(FastifyCookiePlugin);
  fastify.register(require("./routes/auth"));
  fastify.register(require("./routes/game"));

  return fastify;
};
