const {
  isUserWithNameExists,
  getUserByName,
  registerUser
} = require("../user-store");
const User = require("../user");

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
      ...loginProps,
      uniqueLogin: true
    },
    ...passwordScheme
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
      // console.log("body:", request.body);
      const { login, password } = request.body;

      const user = new User(login, password);
      registerUser(user);
      reply.setCookie(...createAuthCookie(user));
      return { result: "success" };
    }
  );

  fastify.post(
    "/api/login",
    { schema: { body: loginSchema } },
    async (request, reply) => {
      const { login, password } = request.body;

      if (isUserWithNameExists(login)) {
        const user = getUserByName(login);
        if (user.isLoginAndPasswordValid(login, password)) {
          reply.setCookie(...createAuthCookie(user));
          return { result: "success" };
        }
      }

      reply.code(400);
      return { error: "Bad Request", message: "Login or password are invalid" };
    }
  );

  fastify.post("/api/logout", async (request, reply) => {
    reply.clearCookie("auth");
    reply.code(204);
  });
}

module.exports = routes;
