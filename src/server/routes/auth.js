const {
  isUserWithNameExists,
  getUserByName,
  registerUser
} = require("../services/user");
const { authCheck } = require("../utils/auth-check");

const passwordScheme = {
  password: { type: "string", minLength: 5, maxLength: 50 }
};
const loginProps = { type: "string", minLength: 5, maxLength: 50 };
const loginSchema = {
  type: "object",
  required: ["login", "password"],
  properties: {
    login: loginProps,
    ...passwordScheme
  }
};

const registrationSchema = {
  type: "object",
  required: ["login", "password"],
  properties: {
    login: {
      ...loginProps
      // uniqueLogin: true
    },
    password: { type: "string", minLength: 5, maxLength: 50 }
  }
};

function createAuthCookie(user) {
  return ["auth", `auth-token#${user.getId()}`];
}

async function routes(fastify) {
  fastify.post(
    "/api/register",
    { schema: { body: registrationSchema } },
    async (request, reply) => {
      const { login, password } = request.body;
      try {
        const user = await registerUser({ login, password });
        reply.setCookie(...createAuthCookie(user));
      } catch (error) {
        reply.code(400);
        return reply.send(error);
      }
      return { result: "success" };
    }
  );

  fastify.post(
    "/api/login",
    { schema: { body: loginSchema } },
    async (request, reply) => {
      const { login, password } = request.body;

      try {
        if (await isUserWithNameExists(login)) {
          const user = await getUserByName(login);
          if (user.isLoginAndPasswordValid(login, password)) {
            reply.setCookie(...createAuthCookie(user));
            return { result: "success" };
          }
        }
        reply.code(400);
        return {
          error: "Bad Request",
          message: "Login or password are invalid"
        };
      } catch (error) {
        reply.code(400);
        return reply.send(error);
      }
    }
  );

  fastify.post("/api/logout", async (request, reply) => {
    reply.clearCookie("auth");
    reply.code(204);
  });

  fastify.get("/api/auth_check", async (request, reply) => {
    const result = authCheck(request);
    reply.code(result.code);
    return reply.send(result.error);
  });
}

module.exports = routes;
