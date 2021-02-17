const { Game, States } = require("../game");

describe("Game", function () {
  describe("should have id", () => {
    let game = null;
    beforeEach(() => {
      game = new Game({});
    });

    it("should have id", () => {
      expect(game.getId()).toEqual(expect.any(Number));
    });
  });

  describe("State", () => {
    let game = null;
    beforeEach(() => {
      game = new Game({});
    });

    it("should be in IDLE state", () => {
      expect(game.getState()).toBe(States.IDLE);
    });

    it("should be in AWAITING_PLAYER after initialization", () => {
      game.initialize();
      expect(game.getState()).toBe(States.AWAITING_PLAYER);
    });
  });
});
