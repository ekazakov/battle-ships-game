const { buildAuthCookie, parseAuthCookie } = require("../utils/cookie");

exports.registerUser = async function registerUser(
  fastify,
  { login, password }
) {
  const res = await fastify.inject({
    method: "POST",
    url: "/api/register",
    payload: { login, password }
  });

  if (res.statusCode !== 204 && res.statusCode !== 200) {
    throw new Error(res.json().message);
  }
  return parseAuthCookie(res.headers["set-cookie"]).id;
};

exports.createGame = async function createGame(fastify, userId) {
  const res = await fastify.inject({
    method: "POST",
    url: "/api/game/create",
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });

  return res.json();
};

exports.joinGame = async function joinGame(fastify, userId, gameId) {
  const res = await fastify.inject({
    method: "POST",
    url: `/api/game/${gameId}/join`,
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });

  if (res.statusCode !== 204 && res.statusCode !== 200) {
    throw new Error(res.json().message);
  }

  return res;
};

exports.leaveGame = async function leaveGame(fastify, userId, gameId) {
  const res = await fastify.inject({
    method: "POST",
    url: `/api/game/${gameId}/join`,
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });

  if (res.statusCode !== 200) {
    throw new Error(res.json().message);
  }

  return res;
};

exports.startGame = async function startGame(fastify, userId, gameId) {
  const res = await fastify.inject({
    method: "POST",
    url: `/api/game/${gameId}/start`,
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });

  if (res.statusCode !== 204 && res.statusCode !== 200) {
    throw new Error(res.json().message);
  }

  return res;
};

exports.getGame = async function getGame(fastify, userId, gameId) {
  return await fastify.inject({
    method: "GET",
    url: `/api/game/${gameId}`,
    headers: {
      cookie: buildAuthCookie(userId)
    }
  });
};
