const { Game, States } = require("../game");

function createPlayer(id) {
  return {
    getId() {
      return `player_${id}`;
    },

    getInfo() {
      return { name: `Player ${id}`, id: this.getId() };
    }
  };
}

describe("Game", function () {
  describe("getId", () => {
    let game = null;
    beforeEach(() => {
      game = new Game({});
    });

    it("should return game id", () => {
      expect(game.getId()).toEqual(expect.any(Number));
    });
  });

  describe("State transitions", () => {
    let game = null;
    let playerA = null;
    let playerB = null;
    beforeEach(() => {
      playerA = createPlayer(1);
      playerB = createPlayer(2);
      game = new Game(playerA);
    });

    afterEach(() => {
      game = null;
      playerA = null;
      playerB = null;
    });

    it("should be in IDLE state", () => {
      expect.hasAssertions();
      expect(game.getState()).toBe(States.IDLE);
    });

    it("should be in AWAITING_PLAYER after initialization", () => {
      expect.hasAssertions();
      game.initialize();
      expect(game.getState()).toBe(States.AWAITING_PLAYER);
    });

    it("should be in AWAITING_START after second player joined", () => {
      expect.hasAssertions();

      game.initialize();
      game.join(playerB);
      expect(game.getState()).toBe(States.AWAITING_START);
    });

    describe("AWAITING_START", () => {
      it("should be in PLAYER_A_TURN after start", () => {
        expect.hasAssertions();

        game.initialize();
        game.join(playerB);
        game.start();
        expect(game.getState()).toBe(States.PLAYER_TURN);
      });

      it("should be in AWAITING_PLAYER after second player leave", () => {
        expect.hasAssertions();
        game.initialize();
        game.join(playerB);
        game.leave(playerB);
        expect(game.getState()).toBe(States.AWAITING_PLAYER);
      });

      it("should be in DESTROYED after owner player leave", () => {
        expect.hasAssertions();
        game.initialize();
        game.join(playerB);
        game.leave(playerA);
        expect(game.getState()).toBe(States.DESTROYED);
      });
    });

    describe("MAKE_TURN", () => {
      it("should hit other player ship and continue current player turn", () => {
        expect.hasAssertions();
        game.initialize();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 6, y: 0 });
        expect(game.getGameState()).toMatchSnapshot({
          state: States.PLAYER_TURN,
          winnerId: null,
          current: { name: "Player 1", id: "player_1" },
          waiting: { name: "Player 2", id: "player_2" }
        });
      });

      it("should switch player on miss", () => {
        expect.hasAssertions();
        game.initialize();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 5, y: 0 });
        expect(game.getGameState()).toMatchSnapshot({
          state: States.PLAYER_TURN,
          winnerId: null,
          current: { name: "Player 2", id: "player_2" },
          waiting: { name: "Player 1", id: "player_1" }
        });
      });

      it("should throw error if waiting player attempts make turn", () => {
        expect.hasAssertions();
        game.initialize();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 5, y: 0 });
        expect(() => game.makeShot(playerA, { x: 6, y: 0 })).toThrow();
      });

      it("should keep player turn on shooting at the hit cell", () => {
        expect.hasAssertions();
        game.initialize();
        game.join(playerB);
        game.start();
        game.makeShot(playerA, { x: 6, y: 0 });
        game.makeShot(playerA, { x: 6, y: 0 });

        expect(game.getGameState()).toMatchSnapshot({
          state: States.PLAYER_TURN,
          winnerId: null,
          current: { name: "Player 1", id: "player_1" },
          waiting: { name: "Player 2", id: "player_2" }
        });
      });
    });
  });
});
