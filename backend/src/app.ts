// TODO: fix custom keywords
// const customAjvKeywords = require("./utils/custom-ajv-keywords");
import { Context } from "./context";

import FastifyCookiePlugin from "fastify-cookie";
import FastifyCors from "fastify-cors";
import fastifyFactory from "fastify";
import { auth } from "./routes/auth";

import { game } from "./routes/game";
import { profile } from "./routes/profile";
import { users } from "./routes/users";
import { DataStorage } from "./storage";
import { resetIds } from "./utils/id-generator";

import { FastifySSEPlugin } from "fastify-sse-v2";

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

export async function buildFastify(options = {}) {
  resetIds();
  // @ts-ignore
  Context.storage = options.storage || (await DataStorage.createFileStore());
  const fastify = fastifyFactory(Object.assign({}, defaultOptions, options));

  fastify.register(FastifySSEPlugin);
  fastify.register(FastifyCookiePlugin);
  fastify.register(FastifyCors, { origin: true, credentials: true });
  fastify.register(auth);
  fastify.register(game);
  fastify.register(profile);
  fastify.register(users);

  return fastify;
}
