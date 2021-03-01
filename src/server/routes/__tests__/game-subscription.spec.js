const EventSource = require("eventsource");
const {
  leaveGame,
  startGame,
  joinGame,
  createGame,
  registerUser
} = require("../../../test-helpers/game-actions");
const { buildAuthCookie } = require("../../../utils/cookie");
const { buildFastify } = require("../../app");

const createUrl = (port, id) =>
  `http://localhost:${port}/api/game/${id}/subscribe`;

describe("Game API: Subscription", () => {
  let fastify = null;

  beforeEach(() => {
    fastify = buildFastify();
  });

  afterEach(() => {
    fastify.close();
    fastify = null;
  });

  let aUserId = null;
  let bUserId = null;
  let game = null;

  beforeEach(async () => {
    aUserId = await registerUser(fastify, {
      login: "UserA",
      password: "password"
    });
    bUserId = await registerUser(fastify, {
      login: "UserB",
      password: "password"
    });

    game = await createGame(fastify, aUserId);
    // await joinGame(fastify, bUserId, game.id);
  });

  it("Create subscription to the game state update", (done) => {
    fastify.listen(0, () => {
      const port = fastify.server.address().port;
      const es = new EventSource(createUrl(port, game.id), {
        headers: { Cookie: buildAuthCookie(aUserId) }
      });

      es.onmessage = (evt) => {
        console.log(evt);
      };
      // es.onopen = (evt) => {
      //   console.log("onopen", evt);
      // };
      es.addEventListener("end", (evt) => {
        console.log("onend", evt);
        done();
      });
      es.onerror = (evt) => {
        console.log("onerror", evt.message);
        if (evt.message != null) {
          done(evt);
        }
      };
    });
  });
});
