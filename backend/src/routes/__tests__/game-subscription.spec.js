const EventSource = require("eventsource");
const {
  makeTurn,
  leaveGame,
  startGame,
  joinGame,
  createGame,
  registerUser
} = require("../../test-helpers/game-actions");
const { buildAuthCookie } = require("../../utils/cookie");
const { buildFastify } = require("../../app");
const { Storage } = require("../../storage");

const createUrl = (port, id) =>
  `http://localhost:${port}/api/game/${id}/subscribe`;

function nextEvent(es) {
  return new Promise((resolve, reject) => {
    es.onmessage = (evt) => {
      // console.log("message:", evt);
      resolve({ ...evt, data: JSON.parse(evt.data) });
    };

    es.onerror = (evt) => {
      if (evt.message != null) {
        console.log("onerror", evt.message);
        reject(evt);
      }
    };
  });
}

function createServer(fastify) {
  return new Promise((resolve) => {
    fastify.listen(0, () => {
      const port = fastify.server.address().port;
      resolve(port);
      // es.onopen = (evt) => {
      //   console.log("onopen", evt);
      // };
      // es.addEventListener("end", (evt) => {
      //   console.log("onend", evt);
      //   done();
      // });
    });
  });
}

describe("Game API: Subscription", () => {
  let fastify = null;

  beforeEach(async () => {
    const storage = await Storage.createMemoryStore();
    fastify = await buildFastify({ storage });
  });

  afterEach(() => {
    fastify.close();
    fastify = null;
    subscription.close();
    subscription = null;
  });

  let aUserId = null;
  let bUserId = null;
  let game = null;
  let port = null;
  let subscription = null;

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
    port = await createServer(fastify);
    subscription = new EventSource(createUrl(port, game.id), {
      headers: { Cookie: buildAuthCookie(aUserId), Origin: "game.app" }
    });
  });

  it("should create subscription to the game", async () => {
    const evt1 = await nextEvent(subscription);

    expect(evt1).toMatchObject({
      data: {
        current: null,
        enemyBoard: null,
        ownBoard: null,
        state: "awaiting",
        waiting: null,
        winnerId: null
      }
    });
  });

  it("should send message when user joined", async () => {
    await nextEvent(subscription);
    const [evt2] = await Promise.all([
      nextEvent(subscription),
      joinGame(fastify, bUserId, game.id)
    ]);
    expect(evt2.data).toMatchSnapshot({
      current: null,
      state: "awaitingStart",
      ownerId: "user_1",
      ownId: "user_1",
      waiting: null,
      winnerId: null
    });
  });

  it("should send message when game started", async () => {
    await joinGame(fastify, bUserId, game.id);
    await nextEvent(subscription);

    const [evt] = await Promise.all([
      nextEvent(subscription),
      startGame(fastify, aUserId, game.id)
    ]);

    expect(evt.data).toMatchSnapshot({
      id: "game_1",
      waiting: "user_2",
      state: "playerTurn",
      current: "user_1",
      ownerId: "user_1",
      secondPlayerId: "user_2",
      winnerId: null
    });
  });

  it("should send message when game destroyed", async () => {
    await nextEvent(subscription);
    const [evt2] = await Promise.all([
      nextEvent(subscription),
      leaveGame(fastify, aUserId, game.id)
    ]);

    expect(evt2).toMatchObject({
      data: {
        current: null,
        enemyBoard: null,
        ownBoard: null,
        state: "destroyed",
        waiting: null,
        winnerId: null
      }
    });
  });

  it("should send message when user make a turn", async () => {
    await joinGame(fastify, bUserId, game.id);
    await startGame(fastify, aUserId, game.id);
    await nextEvent(subscription);

    const [evt2] = await Promise.all([
      nextEvent(subscription),
      makeTurn(fastify, aUserId, game.id, { x: 1, y: 1 })
    ]);

    expect(evt2.data).toMatchSnapshot({
      id: "game_1",
      state: "playerTurn",
      ownerId: "user_1",
      secondPlayerId: "user_2",
      winnerId: null,
      current: "user_2",
      waiting: "user_1"
    });
  });

  it("should not send message when user request errored", async () => {
    await nextEvent(subscription);
    const [evt] = await Promise.all([
      Promise.race([
        nextEvent(subscription),
        new Promise((resolve) => setTimeout(() => resolve("timeout"), 100))
      ]),
      makeTurn(fastify, aUserId, game.id, { x: 0, y: 0 }).catch(() => {})
    ]);
    expect(evt).toBe("timeout");
  });
});
