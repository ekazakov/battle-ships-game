const {
  isUserWithNameExists,
  getUserByName,
  registerUser
} = require("../model");
const User = require("../user");

const loginSchema = {
  type: "object",
  required: ["login", "password"],
  properties: {
    login: {
      type: "string",
      minLength: 5,
      maxLength: 50
    },
    password: { type: "string", minLength: 1, maxLength: 50 }
  }
};

const registrationSchema = {
  type: "object",
  required: ["login", "password"],
  properties: {
    login: {
      type: "string",
      minLength: 5,
      maxLength: 50,
      uniqueLogin: true
    },
    password: { type: "string", minLength: 1, maxLength: 50 }
  }
};

async function routes(fastify) {
  fastify.addHook("onRequest", async function (request) {
    console.log(">>>> preHandler hoo on auth routes:", request.cookies.auth);
  });
  fastify.post(
    "/api/register",
    { schema: { body: registrationSchema } },
    async (request, reply) => {
      // console.log("body:", request.body);
      const { login, password } = request.body;

      const user = new User(login, password);
      registerUser(user);
      reply.setCookie("auth", `auth-token:${user.getId()}`);
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
          reply.setCookie("auth", `auth-token:${user.getId()}`);
          return { result: "success" };
        }
      }

      return { result: "error", message: "Login or password are invalid" };
    }
  );

  fastify.post("/api/logout", async (request, reply) => {
    reply.clearCookie("auth");
    reply.code(204);
  });
}

module.exports = routes;
