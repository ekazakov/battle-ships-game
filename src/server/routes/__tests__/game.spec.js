const EventSource = require("eventsource");
const { buildAuthCookie } = require("../../../utils/cookie");
const { parseAuthCookie } = require("../../../utils/cookie");
const { buildFastify } = require("../../app");

const createUrl = (port, id) =>
  // `http://localhost:${port}/api/game/create`;
  `http://localhost:${port}/api/game/${id}/subscribe`;

describe("Game API", () => {
  let fastify = null;
  let aUserId = null;

  beforeEach(() => {
    fastify = buildFastify();
  });

  afterEach(() => {
    fastify.close();
    fastify = null;
  });

  beforeEach(async () => {
    const res = await fastify.inject({
      method: "POST",
      url: "/api/register",
      payload: { login: "UserA", password: "password" }
    });
    aUserId = parseAuthCookie(res.headers["set-cookie"]).id;
  });

  describe("Create game", () => {
    it("should create new game", async () => {
      expect.hasAssertions();
      const res = await fastify.inject({
        method: "POST",
        url: "/api/game/create",
        headers: {
          cookie: buildAuthCookie(2)
        }
      });

      console.log(res.json());
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        id: "game_1"
      });
    });
  });
  // it("One", (done) => {
  //   fastify.listen(0, () => {
  //     const port = fastify.server.address().port;
  //     const es = new EventSource(createUrl(port, 1));
  //     es.onmessage = (evt) => {
  //       console.log(evt);
  //     };
  //     es.onopen = (evt) => {
  //       console.log("onopen", evt);
  //     };
  //     es.addEventListener("end", (evt) => {
  //       console.log("onend", evt);
  //       done();
  //     });
  //     es.onerror = (evt) => {
  //       console.log("onerror", evt.message);
  //       if (evt.message != null) {
  //         done(evt);
  //       }
  //     };
  //   });
  // });
});
